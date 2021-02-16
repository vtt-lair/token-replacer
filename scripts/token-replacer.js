const tokenPathDefault = "modules/token-replacer/tokens/";
const difficultyNameDefault = "cr";
const difficultyVariableDefault = "data.details.cr";
const portraitPrefixDefault = "";
const BAD_DIRS = ["[data]", "[data] ", "", null];

let cachedTokens = [];
let replaceToken;
let tokenDirectory;
let difficultyName;
let difficultyVariable;
let portraitPrefix;
let hookedFromTokenCreation = false;
let imageNameFormat;
let debug = false;
let nameFormats = [];
let folderFormats = [];

let selectedFolderFormat;
let selectedNameFormat;

Handlebars.registerHelper('findSelected', function(elem, list, options) {
    if (elem) {
        return elem.find((x) => x.selected).value;
    }
    return "|Not Defined|";
});

Hooks.on("renderTokenReplacerSetup", (app, html, user) => {
    DirectoryPicker.processHtml(html);
});

Hooks.on("renderSettingsConfig", (app, html, user) => {
    DirectoryPicker.processHtml(html);
});

// Token Replacer Setup Menu
class TokenReplacerSetup extends FormApplication {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = "token-replacer-settings";
        options.template = "modules/token-replacer/handlebars/settings.handlebars";
        options.width = 500;
        return options;
    }    
  
    get title() { 
         "Token Replacer Settings";
    }
  
    /** @override */
    async getData() {
        const tokenDir = game.settings.get("token-replacer", "tokenDirectory");
        const diffName = game.settings.get("token-replacer", "difficultyName");
        const diffVariable = game.settings.get("token-replacer", "difficultyVariable");
        const prefix = game.settings.get("token-replacer", "portraitPrefix");

        // file name formats
        let imgNameFormat = game.settings.get("token-replacer", "imageNameFormat");        
        if (imgNameFormat === null || imgNameFormat === -1) {
            imgNameFormat = 0;
        }
        if (imgNameFormat !== null && imgNameFormat > -1) {
            nameFormats[imgNameFormat].selected = true;
        }

        // folder name formats
        let folderNameFormat = game.settings.get("token-replacer", "folderNameFormat");        
        if (folderNameFormat === null || folderNameFormat === -1) {
            folderNameFormat = 0;
        }
        if (folderNameFormat !== null && folderNameFormat > -1) {
            folderFormats[folderNameFormat].selected = true;
        }

        const dataDirSet = !BAD_DIRS.includes(tokenDir);

        const setupConfig = {
            "tokenDirectory": tokenDir,
            "difficultyName": diffName,
            "difficultyVariable": diffVariable,
            "portraitPrefix": prefix,
            "nameFormats": nameFormats,
            "folderFormats": folderFormats,
        };

        let diffSpecified = true;
        if (diffName !== "" && diffVariable === "") {
            diffSpecified = false;
        }
        
        const setupComplete = dataDirSet && diffSpecified;

        return {
            setupConfig: setupConfig,
            setupComplete: setupComplete,
        };
    }
  
    /** @override */
    async _updateObject(event, formData) {
        event.preventDefault();

        const tokenDir = formData['token-directory'];
        const diffName = formData['difficulty-name'];
        let diffVariable = formData['difficulty-variable'];
        const prefix = formData['portrait-prefix'];

        const imageNameFormat = formData['image-name-format'];
        const imageNameIdx = nameFormats.findIndex(x => x.value === imageNameFormat);
        nameFormats.forEach((x) => {
            x.selected = false;
        });
        if (imageNameIdx !== null && imageNameIdx > -1) {
            nameFormats[imageNameIdx].selected = true;
        }

        const folderNameFormat = formData['folder-name-format'];
        const folderNameIdx = folderFormats.findIndex(x => x.value === folderNameFormat);
        folderFormats.forEach((x) => {
            x.selected = false;
        });
        if (imageNameIdx !== null && imageNameIdx > -1) {
            folderFormats[folderNameIdx].selected = true;
        }

        // if not difficulty name is specified then the variable is not needed
        if (diffName === "") {
            diffVariable = "";
        }

        await game.settings.set("token-replacer", "tokenDirectory", tokenDir);
        await game.settings.set("token-replacer", "difficultyName", diffName);
        await game.settings.set("token-replacer", "difficultyVariable", diffVariable);
        await game.settings.set("token-replacer", "portraitPrefix", prefix);
        await game.settings.set("token-replacer", "imageNameFormat", imageNameIdx);
        await game.settings.set("token-replacer", "folderNameFormat", folderNameIdx);

        const debug = game.settings.get("token-replacer", "debug");
        if (debug) {
            if (folderNameFormat === "proper") {
                folderNameFormat = " ";
            }
            if (imageNameFormat === "proper") {
                imageNameFormat = " ";
            }
            console.log(`Token Replacer: Format Structure Setup: '${tokenDirectory.activeSource}/${tokenDirectory.current}/${diffName}${folderNameFormat}0_25/Monster${imageNameFormat}Name.png'`);
        }
        
        const tokenDirSet = !BAD_DIRS.includes(tokenDir);

        if (!tokenDirSet) {
            $('#setup-feedback').text(`Please set the token directory to something other than the root.`);
            $('#token-replacer-settings').css("height", "auto");
            throw new Error(`Please set the token directory to something other than the root.`);
        } else if (diffName !== "" && diffVariable === "") {
            $('#setup-feedback').text(`If there is a 'Difficulty Name', you NEED to specify the 'Difficulty Variable'.`);
            $('#ddb-importer-settings').css("height", "auto");
            throw new Error(`If there is a 'Difficulty Name', you NEED to specify the 'Difficulty Variable'.`);
        } else {
            // recache the tokens
            cacheAvailableFiles();            
        }
    }
}

class DirectoryPicker extends FilePicker {
    constructor(options = {}) {
      super(options);
    }
  
    _onSubmit(event) {
        event.preventDefault();
        const path = event.target.target.value;
        const activeSource = this.activeSource;
        const bucket = event.target.bucket ? event.target.bucket.value : null;
        this.field.value = DirectoryPicker.format({
        activeSource,
        bucket,
        path,
        });
        this.close();
    }
  
    static async uploadToPath(path, file) {
        const options = DirectoryPicker.parse(path);
        return FilePicker.upload(options.activeSource, options.current, file, { bucket: options.bucket });
    }
  
    // returns the type "Directory" for rendering the SettingsConfig
    static Directory(val) {
        return val;
    }
  
    // formats the data into a string for saving it as a GameSetting
    static format(value) {
        return value.bucket !== null
        ? `[${value.activeSource}:${value.bucket}] ${value.path}`
        : `[${value.activeSource}] ${value.path}`;
    }
  
    // parses the string back to something the FilePicker can understand as an option
    static parse(str) {
        let matches = str.match(/\[(.+)\]\s*(.+)/);
        if (matches) {
        let source = matches[1];
        const current = matches[2].trim();
        const [s3, bucket] = source.split(":");
        if (bucket !== undefined) {
            return {
            activeSource: s3,
            bucket: bucket,
            current: current,
            };
        } else {
            return {
            activeSource: s3,
            bucket: null,
            current: current,
            };
        }
        }
        // failsave, try it at least
        return {
        activeSource: "data",
        bucket: null,
        current: str,
        };
    }
  
    // Adds a FilePicker-Simulator-Button next to the input fields
    static processHtml(html) {
        $(html)
        .find(`input[data-dtype="Directory"]`)
        .each((index, element) => {
            // disable the input field raw editing
            $(element).prop("readonly", true);

            // if there is no button next to this input element yet, we add it
            if (!$(element).next().length) {
            let picker = new DirectoryPicker({
                field: $(element)[0],
                ...DirectoryPicker.parse($(element).val()),
            });
            let pickerButton = $(
                '<button type="button" class="file-picker" data-type="imagevideo" data-target="img" title="Pick directory"><i class="fas fa-file-import fa-fw"></i></button>'
            );
            pickerButton.on("click", () => {
                picker.render(true);
            });
            $(element).parent().append(pickerButton);
            }
        });
    }
  
    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // remove unnecessary elements
        $(html).find("ol.files-list").remove();
        $(html).find("footer div").remove();
        $(html).find("footer button").text("Select Directory");
    }
}

function folderSelected(selected) {
    selectedFolderFormat = selected.value;
}

// initialisation
function init() {
    console.log("Token Replacer initialising...");

    // hook up events
    hookupEvents();
};

// module ready
function ready() {
    // cache the tokens
    cacheAvailableFiles();
};

function registerSettings() {
    // token replacement setting
    game.settings.register("token-replacer", "replaceToken", {
        name: game.i18n.localize("TR.ReplaceToken.Name"),
        hint: game.i18n.localize("TR.ReplaceToken.Hint"),
        scope: "world",
        config: true,
        type: Number,
        choices: {
            0: game.i18n.localize("TR.ReplaceToken.Choices.Disabled"),
            1: game.i18n.localize("TR.ReplaceToken.Choices.Token"),
            2: game.i18n.localize("TR.ReplaceToken.Choices.Portrait"),
            3: game.i18n.localize("TR.ReplaceToken.Choices.TokenPortrait"),
        },
        default: 0,
    });

    game.settings.register("token-replacer", "debug", {
        name: game.i18n.localize("TR.Debug.Name"),
        hint: game.i18n.localize("TR.Debug.Hint"),
        scope: 'world',
        type: Boolean,
        default: false,
        config: true,
      });
    
    game.settings.registerMenu("token-replacer", "setupMenu", {
        name: game.i18n.localize("TR.Settings.Name"),
        label: game.i18n.localize("TR.Settings.Name"),
        hint: game.i18n.localize("TR.Settings.Hint"),
        icon: 'fas fa-wrench',
        type: TokenReplacerSetup,
        restricted: true
      });

    // token directory
    game.settings.register("token-replacer", "tokenDirectory", {
        name: game.i18n.localize("TR.TokenDirectory.Name"),
        hint: game.i18n.localize("TR.TokenDirectory.Name"),
        scope: "world",
        config: false,
        type: DirectoryPicker.Directory,
        default: `[data] ${tokenPathDefault}`,
    });

    // token subdirectory path setting
    game.settings.register("token-replacer", "difficultyName", {
        name: game.i18n.localize("TR.DifficultyName.Name"),
        hint: game.i18n.localize("TR.DifficultyName.Name"),
        scope: "world",
        config: false,
        type: String,
        default: difficultyNameDefault,
    });

    game.settings.register("token-replacer", "difficultyVariable", {
        name: game.i18n.localize("TR.DifficultyVariable.Name"),
        hint: game.i18n.localize("TR.DifficultyVariable.Name"),
        scope: "world",
        config: false,
        type: String,
        default: difficultyVariableDefault,
    });

    game.settings.register("token-replacer", "portraitPrefix", {
        name: game.i18n.localize("TR.PortraitPrefix.Name"),
        hint: game.i18n.localize("TR.PortraitPrefix.Name"),
        scope: "world",
        config: false,
        type: String,
        default: portraitPrefixDefault,
    });

    game.settings.register("token-replacer", "imageNameFormat", {
        name: game.i18n.localize("TR.ImageNameFormat.Name"),
        hint: game.i18n.localize("TR.ImageNameFormat.Hint"),
        scope: "world",
        config: false,
        type: Number,
        choices: {
            0: game.i18n.localize("TR.ImageNameFormat.Choices.Underscored"),
            1: game.i18n.localize("TR.ImageNameFormat.Choices.Proper"),
            2: game.i18n.localize("TR.ImageNameFormat.Choices.Dashed"),            
        },
        default: 0,
    });

    game.settings.register("token-replacer", "folderNameFormat", {
        name: game.i18n.localize("TR.ImageNameFormat.Name"),
        hint: game.i18n.localize("TR.ImageNameFormat.Hint"),
        scope: "world",
        config: false,
        type: Number,
        choices: {
            0: game.i18n.localize("TR.ImageNameFormat.Choices.NoSpace"),
            1: game.i18n.localize("TR.ImageNameFormat.Choices.Underscored"),
            2: game.i18n.localize("TR.ImageNameFormat.Choices.Proper"),
            3: game.i18n.localize("TR.ImageNameFormat.Choices.Dashed"),            
        },
        default: 0,
    });

    createImageFormat(0);
    createFolderFormat(0);
}

/** handle functions **/
// grab the already saved settings
function grabSavedSettings() {
    replaceToken = game.settings.get("token-replacer", "replaceToken") ?? 0;
    if (game.settings.get("token-replacer", "tokenDirectory") === "[data] " || "") {
        tokenDirectory = { 
            activeSource: "data",
            current: tokenPathDefault,
        }
    } else {
        tokenDirectory = DirectoryPicker.parse(game.settings.get("token-replacer", "tokenDirectory"))
    }    
    difficultyName = game.settings.get("token-replacer", "difficultyName");
    difficultyVariable = game.settings.get("token-replacer", "difficultyVariable");
    portraitPrefix = game.settings.get("token-replacer", "portraitPrefix");

    let imageNameFormatIndex = game.settings.get("token-replacer", "imageNameFormat");    
    if (imageNameFormatIndex === null || imageNameFormatIndex === -1) {
        imageNameFormatIndex = 0;
    }    
    imageNameFormat = nameFormats[imageNameFormatIndex].value;
    if (imageNameFormat === "proper") {
        imageNameFormat = " ";
    }

    let folderNameFormatIndex = game.settings.get("token-replacer", "folderNameFormat");    
    if (folderNameFormatIndex === null || folderNameFormatIndex === -1) {
        folderNameFormatIndex = 0;
    }    
    folderNameFormat = folderFormats[folderNameFormatIndex].value;
    if (folderNameFormat === "proper") {
        folderNameFormat = " ";
    }

    debug = game.settings.get("token-replacer", "debug");
}

function createImageFormat(selected) {
    nameFormats = [            
        {
            name: "TR.ImageNameFormat.Choices.Underscored",
            value: "_",
            selected: false,
        },
        {
            name: "TR.ImageNameFormat.Choices.Proper",
            value: "proper",
            selected: false,
        },
        {
            name: "TR.ImageNameFormat.Choices.Dashed",
            value: "-",
            selected: false,
        }
    ];

    if (selected) {
        nameFormats[selected].selected = true;
    }        
}

function createFolderFormat(selected) {
    folderFormats = [
        {
            name: "TR.FolderNameFormat.Choices.NoSpace",
            value: "",
            selected: false,
        },            
        {
            name: "TR.FolderNameFormat.Choices.Underscored",
            value: "_",
            selected: false,
        },
        {
            name: "TR.FolderNameFormat.Choices.Proper",
            value: "proper",
            selected: false,
        },
        {
            name: "TR.FolderNameFormat.Choices.Dashed",
            value: "-",
            selected: false,
        }
    ];

    if (selected) {
        folderFormats[selected].selected = true;
    }        
}

// cache the set of available tokens which can be used to replace artwork to avoid repeated filesystem requests
async function cacheAvailableFiles() {
    // grab the saved values
    grabSavedSettings();

    cachedTokens = [];
    
    if (debug) {
        console.log(`Token Replacer: Caching root folder: '${tokenDirectory.activeSource}', '${tokenDirectory.current}'`);
    }
    // any files in the root (maybe they didn't want to use subfolders)    
    const rootTokens = await FilePicker.browse(tokenDirectory.activeSource, tokenDirectory.current);
    rootTokens.files.forEach(t => cachedTokens.push(t.toLowerCase()));

    const folders = await FilePicker.browse(tokenDirectory.activeSource, tokenDirectory.current);
    // any files in subfolders
	for ( let folder of folders.dirs ) {
        if (debug) {
            console.log(`Token Replacer: Caching folders: '${tokenDirectory.activeSource}', '${folder}'`);
        }
		const tokens = await FilePicker.browse(tokenDirectory.activeSource, folder);
		tokens.files.forEach(t => cachedTokens.push(t.toLowerCase()));
	}
}

// hook events hooked up
function hookupEvents() {
    // setup hook for replacement before and during actor creation
    Hooks.on("preCreateActor", preCreateActorHook);
    Hooks.on("createActor", createActorHook);    
    
    // make sure we change the image each time we drag a token from the actors
    Hooks.on("preCreateToken", preCreateTokenHook);
    Hooks.on("createToken", createTokenHook);
}

// handle preCreateActor hook
function preCreateActorHook(data, options, userId) {
    // grab the saved values
    grabSavedSettings();
    hookedFromTokenCreation = false;

    if (debug) {
        console.log(`Token Replacer: preCreateActorHook: Data:`, data);
    }

    let hasDifficultProperty = hasProperty(data, difficultyVariable);
    if (!difficultyVariable) {
        // overwrite since it's empty
        hasDifficultProperty = true;
    }

    if ( !replaceToken || (data.type !== "npc") || !hasDifficultProperty ) return;
    replaceArtWork(data);    
}

// handle createActor hook
function createActorHook(data, tokenData, flags, id) {
    // grab the saved values
    grabSavedSettings();
    const passData = data.data;
    hookedFromTokenCreation = false;

    if (debug) {
        console.log(`Token Replacer: createActorHook: Data:`, data);        
    }

    let hasDifficultProperty = hasProperty(passData, difficultyVariable);
    if (!difficultyVariable) {
        // overwrite since it's empty
        hasDifficultProperty = true;
    }

    if ( !replaceToken || (passData.type !== "npc") || !hasDifficultProperty ) return;
    replaceArtWork(passData);
    data.update(passData);
}

// handle preCreateToken hook
function preCreateTokenHook(scene, tokenData, flags, id) {
    // grab the saved values
    grabSavedSettings();
    const actor = game.actors.get(tokenData.actorId);    

    if (debug) {
        console.log(`Token Replacer: preCreateTokenHook: Before: TokenData:`, tokenData);
        console.log(`Token Replacer: preCreateTokenHook: Before: Actor:`, actor);        
    }

    if (actor) {
        const passData = actor.data;
        if (debug) {
            console.log(`Token Replacer: preCreateTokenHook: Before: PassData:`, passData);
        }
        hookedFromTokenCreation = true;

        let hasDifficultProperty = hasProperty(passData, difficultyVariable);
        if (!difficultyVariable) {
            // overwrite since it's empty
            hasDifficultProperty = true;
        }

        if ( !replaceToken || (passData.type !== "npc") || !hasDifficultProperty ) return;
        replaceArtWork(passData);
        actor.update(passData);

        if (debug) {
            console.log(`Token Replacer: preCreateTokenHook: After: TokenData:`, tokenData);
            console.log(`Token Replacer: preCreateTokenHook: After: Actor:`, actor);
            console.log(`Token Replacer: preCreateTokenHook: After: PassData:`, passData);
        }
    }        
}

async function createTokenHook(scene, tokenData, flags, id) {
    const actor = game.actors.get(tokenData.actorId);

    if (debug) {
        console.log(`Token Replacer: createTokenHook: Before: TokenData:`, tokenData);
        console.log(`Token Replacer: createTokenHook: Before: Actor:`, actor);        
    }

    if (actor) {
        const token = new Token(tokenData);

        token.scene = scene;
        token.update({"img": actor.data.token.img});

        if (debug) {
            console.log(`Token Replacer: createTokenHook: After: TokenData:`, tokenData);
            console.log(`Token Replacer: createTokenHook: After: Actor:`, actor);        
        }
    }
}

// replace the artwork for a NPC actor with the version from this module
function replaceArtWork(data) {
    if (debug) {
        console.log(`Token Replacer: Replacing Artwork`);        
    }

    const formattedName = escape(data.name.trim().replace(/ /g, imageNameFormat));
    const diffDir = (difficultyName) ? `${String(getProperty(data, difficultyVariable)).replace(".", "_")}/` : "";
    let tokenCheck = escape(`${tokenDirectory.current}/${difficultyName}${folderNameFormat}${diffDir}${formattedName}`);
    let portraitCheck;

    if (portraitPrefix) {
        portraitCheck = escape(`${tokenDirectory.current}/${difficultyName}${folderNameFormat}${diffDir}${portraitPrefix}${formattedName}`);
    } else {
        portraitCheck = tokenCheck;
    }

    // Update variable values with single forward slash instead of double in case the setting passed in had a
    // trailing slash and we added another in path assembly.
    portraitCheck = portraitCheck.replace("//","/").toLowerCase();
    tokenCheck = tokenCheck.replace("//","/").toLowerCase();

    const filteredCachedTokens = cachedTokens.filter(t => t.toLowerCase().indexOf(tokenCheck.toLowerCase()) >= 0);
    let filteredCachedPortraits = cachedTokens.filter(t => t.toLowerCase().indexOf(portraitCheck.toLowerCase()) >= 0);
    filteredCachedPortraits = (filteredCachedPortraits) ?? filteredCachedTokens;
    if (!filteredCachedPortraits.length) {
        filteredCachedPortraits = filteredCachedTokens;
    }

    data.token = data.token || {};

    // if we should replace the portrait art and the call is not from PreCreateToken.
    // we only change the art if the art is still the default mystery man
    // otherwise the portrait art will change every time we put a token on the scene
    if (
        (filteredCachedPortraits && filteredCachedPortraits.length) &&
        replaceToken === 2 || replaceToken === 3 && (!hookedFromTokenCreation || data.img === 'icons/svg/mystery-man.svg')
    ) {
        let randomIdx = Math.floor(Math.random() * (filteredCachedPortraits.length * filteredCachedPortraits.length));
        randomIdx = Math.floor(randomIdx / filteredCachedPortraits.length);
        const portraitSrc = filteredCachedPortraits[randomIdx];

        if (debug) {
            console.log(`Token Replacer: Replacing portrait art. From: '${data.img}', To: '${portraitSrc}'`);
        }

        data.img = portraitSrc;        
    }

    // we should replace the token art
    if (
        (filteredCachedTokens && filteredCachedTokens.length) &&
        replaceToken === 1 || replaceToken === 3
    ) {
        let randomIdx = Math.floor(Math.random() * (filteredCachedTokens.length * filteredCachedTokens.length));
        randomIdx = Math.floor(randomIdx / filteredCachedTokens.length);
        const tokenSrc = filteredCachedTokens[randomIdx];

        if (debug) {
            console.log(`Token Replacer: Replacing token art. From: '${data.token.img}', To: '${tokenSrc}'`);
        }

        data.token.img = tokenSrc;
    }
    
    return data;
}

Hooks.once("init", init);
Hooks.once("ready", registerSettings);
Hooks.on("ready", ready);
