const tokenPathDefault = "modules/token-replacer/tokens/";
const difficultyNameDefault = "cr";
const difficultyVariableDefault = "data.details.cr";
const BAD_DIRS = ["[data]", "[data] ", "", null];

let cachedTokens = [];
let replaceToken;
let tokenDirectory;
let difficultyName;
let difficultyVariable;
let hookedFromTokenCreation = false;

Hooks.on("renderTokenReplacerSetup", (app, html, user) => {
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
        
        const dataDirSet = !BAD_DIRS.includes(tokenDir);

        const setupConfig = {
            "tokenDirectory": tokenDir,
            "difficultyName": diffName,
            "difficultyVariable": diffVariable,
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

        // if not difficulty name is specified then the variable is not needed
        if (diffName === "") {
            diffVariable = "";
        }

        await game.settings.set("token-replacer", "tokenDirectory", tokenDir);
        await game.settings.set("token-replacer", "difficultyName", diffName);
        await game.settings.set("token-replacer", "difficultyVariable", diffVariable);

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
            cacheAvailableTokens();            
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
  
Hooks.on("renderSettingsConfig", (app, html, user) => {
    DirectoryPicker.processHtml(html);
});

// initialisation
function init() {
    console.log("Token Replacer initialising...");

    // hook up events
    hookupEvents();
};

// module ready
function ready() {
    // cache the tokens
    cacheAvailableTokens();
};

function registerSettings() {
    // token replacement setting
    game.settings.register("token-replacer", "replaceToken", {
        name: "Automatically replace NPC actor artwork",
        hint: "Automatically replace the token and/or portrait artwork for NPC actors when imported. Make sure the image file name starts with the actor name, empty spaces should be replaced by '_'. " + 
            "Token art will be randomised if more than one artwork is found that start with the same name. " +
            "Portrait art will never randomise and will only be replaced when adding the actor the first time.",
        scope: "world",
        config: true,
        type: Number,
        choices: {
            0: "Disabled",
            1: "Replace token artwork",
            2: "Replace portrait artwork",
            3: "Replace token & portrait artwork",
        },
        default: 0,
    });
    
    game.settings.registerMenu("token-replacer", 'setupMenu', {
        name: "Settings",
        label: "Settings",
        hint: "Token directory settings",
        icon: 'fas fa-wrench',
        type: TokenReplacerSetup,
        restricted: true
      });

    // token directory
    game.settings.register("token-replacer", "tokenDirectory", {
        name: "Token Directory",
        hint: "The directory the tokens are found in. Defaults to the free Forgotten Adventures tokens. It's however advised to change this directory to something NOT in the modules directory as new versions will overwrite any tokens you save there.",
        scope: "world",
        config: false,
        type: DirectoryPicker.Directory,
        default: `[data] ${tokenPathDefault}`,
    });

    // token subdirectory path setting
    game.settings.register("token-replacer", "difficultyName", {
        name: "NPC Difficulty Name",
        hint: "The difficulty measurement name used in your system (defaults to 'cr' for DnD 5e). " + 
            "Token art should be put under folders named after this measurement and is case sensitive (the cr1 subfolder should have all cr1 tokens). " + 
            "Leaving this empty will mean you need to save the images in the root of the tokens path and not in subfolders and the 'NPC Difficulty Variable' is not checked to figure out subfolder structures.",
        scope: "world",
        config: false,
        type: String,
        default: difficultyNameDefault,
    });

    game.settings.register("token-replacer", "difficultyVariable", {
        name: "NPC Difficulty Variable",
        hint: "The difficulty measurement variable used in the actor's data (defaults to DnD 5e's). This is dependant on whether you entered an 'NPC Difficulty Name'. " + 
            "If you are unsure what the variable is, leave 'NPC Difficulty Name' empty and save everyting into the root folder.",
        scope: "world",
        config: false,
        type: String,
        default: difficultyVariableDefault,
    });
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
}

// cache the set of available tokens which can be used to replace artwork to avoid repeated filesystem requests
async function cacheAvailableTokens() {
    // grab the saved values
    grabSavedSettings();

    cachedTokens = [];
    
    // any files in the root (maybe they didn't want to use subfolders)
    const rootTokens = await FilePicker.browse(tokenDirectory.activeSource, tokenDirectory.current);
    rootTokens.files.forEach(t => cachedTokens.push(t));

    const folders = await FilePicker.browse(tokenDirectory.activeSource, tokenDirectory.current);
    // any files in subfolders
	for ( let folder of folders.dirs ) {
		const tokens = await FilePicker.browse(tokenDirectory.activeSource, folder);
		tokens.files.forEach(t => cachedTokens.push(t));
	}
}

// hook events hooked up
function hookupEvents() {
    // setup hook for replacement before and during actor creation
    Hooks.on("preCreateActor", preCreateActorHook);
    Hooks.on("createActor", createActorHook);    
    
    // make sure we change the image each time we drag a token from the actors
    Hooks.on("preCreateToken", preCreateTokenHook);
}

// handle preCreateActor hook
function preCreateActorHook(data, options, userId) {
    // grab the saved values
    grabSavedSettings();
    hookedFromTokenCreation = false;

    let hasDifficultProperty = hasProperty(data, difficultyVariable);
    if (!difficultyVariable) {
        // overwrite since it's empty
        hasDifficultProperty = true;
    }

    if ( !replaceToken || (data.type !== "npc") || !hasDifficultProperty ) return;
    replaceArtWork(data);    
}

// handle createActor hook
function createActorHook(data, options, userId) {
    // grab the saved values
    grabSavedSettings();
    const passData = data.data;
    hookedFromTokenCreation = false;

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
function preCreateTokenHook(data, options, userId) {
    // grab the saved values
    grabSavedSettings();
    const actor = game.actors.get(options.actorId);
    const passData = actor.data;
    hookedFromTokenCreation = true;

    let hasDifficultProperty = hasProperty(passData, difficultyVariable);
    if (!difficultyVariable) {
        // overwrite since it's empty
        hasDifficultProperty = true;
    }

    if ( !replaceToken || (passData.type !== "npc") || !hasDifficultProperty ) return;
    replaceArtWork(passData);
    actor.update(passData);
}

// replace the artwork for a NPC actor with the version from this module
function replaceArtWork(data) {
    const formattedName = escape(data.name.replace(/ /g, "_"));
	const diffDir = (difficultyName) ? `${String(getProperty(data, difficultyVariable)).replace(".", "_")}/` : "";
    const tokenCheck = `${tokenDirectory.current}/${difficultyName}${diffDir}${formattedName}`;
    
    const filteredCachedTokens = cachedTokens.filter(t => t.toLowerCase().indexOf(tokenCheck.toLowerCase()) >= 0);
    if (!filteredCachedTokens || (filteredCachedTokens && !filteredCachedTokens.length)) return;

    if (filteredCachedTokens && filteredCachedTokens.length) {
        const randomIdx = Math.floor(Math.random() * (filteredCachedTokens.length - 1));
        const tokenSrc = filteredCachedTokens[randomIdx];

        data.token = data.token || {};
        // if we should replace the portrait art and the call is not from PreCreateToken.
        // we only change the art if the art is still the defaul mystery
        // otherwise the portrait art will change every time we put a token on the scene
        if (replaceToken === 2 || replaceToken === 3 && (!hookedFromTokenCreation || data.img === 'icons/svg/mystery-man.svg')) {
            data.img = tokenSrc;
        }
        // we should replace the token art
        if (replaceToken === 1 || replaceToken === 3) {
            data.token.img = tokenSrc;
        }	
    }
    
    return data;
}

Hooks.once("init", init);
Hooks.once("ready", registerSettings);
Hooks.on("ready", ready);