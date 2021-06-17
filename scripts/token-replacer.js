const tr_tokenPathDefault = "modules/token-replacer/tokens/";
const tr_difficultyNameDefault = "cr";
const tr_difficultyVariableDefault = "data.details.cr";
const tr_portraitPrefixDefault = "";
const tr_useStructureDefault = true;
const tr_BAD_DIRS = ["[data]", "[data] ", "", null];

let tr_cachedTokens = [];
let tr_replaceToken;
let tr_tokenDirectory;
let tr_difficultyName;
let tr_difficultyVariable;
let tr_portraitPrefix;
let tr_hookedFromTokenCreation = false;
let tr_imageNameFormat;
let tr_isTRDebug = false;
let tr_useStructure = true;
let tr_nameFormats = [];
let tr_folderFormats = [];

let selectedFolderFormat;
let selectedNameFormat;

Handlebars.registerHelper('findSelected', function(elem, list, options) {
    if (elem) {
        return elem.find((x) => x.selected).value;
    }
    return "|Not Defined|";
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
            tr_nameFormats[imgNameFormat].selected = true;
        }

        // folder name formats
        let folderNameFormat = game.settings.get("token-replacer", "folderNameFormat");        
        if (folderNameFormat === null || folderNameFormat === -1) {
            folderNameFormat = 0;
        }
        if (folderNameFormat !== null && folderNameFormat > -1) {
            tr_folderFormats[folderNameFormat].selected = true;
        }

        const useDefinedStructures = game.settings.get("token-replacer", "structure");

        const dataDirSet = !tr_BAD_DIRS.includes(tokenDir);

        const setupConfig = {
            "tokenDirectory": tokenDir,
            "difficultyName": diffName,
            "difficultyVariable": diffVariable,
            "portraitPrefix": prefix,
            "nameFormats": tr_nameFormats,
            "folderFormats": tr_folderFormats,
            "useDefinedStructures": useDefinedStructures
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
        const imageNameIdx = tr_nameFormats.findIndex(x => x.value === imageNameFormat);
        tr_nameFormats.forEach((x) => {
            x.selected = false;
        });
        if (imageNameIdx !== null && imageNameIdx > -1 && tr_nameFormats[imageNameIdx]) {
            tr_nameFormats[imageNameIdx].selected = true;
        }

        const folderNameFormat = formData['folder-name-format'];
        const folderNameIdx = tr_folderFormats.findIndex(x => x.value === folderNameFormat);
        tr_folderFormats.forEach((x) => {
            x.selected = false;
        });
        if (folderNameIdx !== null && folderNameIdx > -1) {
            tr_folderFormats[folderNameIdx].selected = true;
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

        const isTRDebug = game.settings.get("token-replacer", "debug");
        if (isTRDebug) {
            if (folderNameFormat === "proper") {
                folderNameFormat = " ";
            }
            if (imageNameFormat === "proper") {
                imageNameFormat = " ";
            }
            console.log(`Token Replacer: Format Structure Setup: '${tr_tokenDirectory.activeSource}/${tr_tokenDirectory.current}/${diffName}${folderNameFormat}0_25/Monster${imageNameFormat}Name.png'`);
        }
        
        const tokenDirSet = !tr_BAD_DIRS.includes(tokenDir);

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
            tokenReplacerCacheAvailableFiles();            
        }
    }
}

// Directory Picker
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

// Token Config
const TokenReplacerDisabler = {
    getReplacerDisabled: function(token) {
        return token.getFlag('token-replacer', 'disabled');
    },

    onConfigRender: function(config, html) {
		const disabled = TokenReplacerDisabler.getReplacerDisabled(config.token);
		const imageTab = html.find('.tab[data-tab="image"]');

		imageTab.append($(`
			<fieldset class="token-replacer">
				<legend>${game.i18n.localize('TR.TokenConfig.Heading')}</legend>
                <label class="checkbox">
                    <input type="checkbox" name="flags.token-replacer.disabled"
                            ${disabled ? 'checked' : ''}>
                    ${game.i18n.localize('TR.TokenConfig.Disable')}
                </label>			
			</fieldset>
		`));
	}
}
Hooks.on("renderTokenConfig", TokenReplacerDisabler.onConfigRender);

function folderSelected(selected) {
    selectedFolderFormat = selected.value;
}

const TokenReplacer = {
    grabSavedSettings() {
        tr_replaceToken = game.settings.get("token-replacer", "replaceToken") ?? 0;
        if (game.settings.get("token-replacer", "tokenDirectory") === "[data] " || "") {
            tr_tokenDirectory = { 
                activeSource: "data",
                current: tr_tokenPathDefault,
            }
        } else {
            tr_tokenDirectory = DirectoryPicker.parse(game.settings.get("token-replacer", "tokenDirectory"))
        }    
        tr_difficultyName = game.settings.get("token-replacer", "difficultyName");
        tr_difficultyVariable = game.settings.get("token-replacer", "difficultyVariable");
        tr_portraitPrefix = game.settings.get("token-replacer", "portraitPrefix");

        let imageNameFormatIndex = game.settings.get("token-replacer", "imageNameFormat");    
        if (imageNameFormatIndex === null || imageNameFormatIndex === -1) {
            imageNameFormatIndex = 0;
        }    
        tr_imageNameFormat = tr_nameFormats[imageNameFormatIndex].value;
        if (tr_imageNameFormat === "proper") {
            tr_imageNameFormat = " ";
        }

        let folderNameFormatIndex = game.settings.get("token-replacer", "folderNameFormat");    
        if (folderNameFormatIndex === null || folderNameFormatIndex === -1) {
            folderNameFormatIndex = 0;
        }    
        folderNameFormat = tr_folderFormats[folderNameFormatIndex].value;
        if (folderNameFormat === "proper") {
            folderNameFormat = " ";
        }

        tr_useStructure = game.settings.get("token-replacer", "structure");
        tr_isTRDebug = game.settings.get("token-replacer", "debug");
    },
    
    hookupEvents() {
        // setup hook for replacement before and during actor creation
        //Hooks.on("preCreateActor", preCreateActorHook);
        Hooks.on("createActor", TokenReplacer.createActorHook);    
        
        // make sure we change the image each time we drag a token from the actors
        Hooks.on("preCreateToken", TokenReplacer.preCreateTokenHook);
        Hooks.on("createToken", TokenReplacer.createTokenHook);
    },

    // handle preCreateActor hook
    preCreateActorHook(document, options, userId) {
        // grab the saved values
        TokenReplacer.grabSavedSettings();
        tr_hookedFromTokenCreation = false;

        if (tr_isTRDebug) {
            console.log(`Token Replacer: preCreateActorHook: Data:`, document);
        }

        let hasDifficultProperty = hasProperty(document, tr_difficultyVariable);
        if (!tr_difficultyVariable) {
            // overwrite since it's empty
            hasDifficultProperty = true;
        }

        if ( !tr_replaceToken || (document.type !== "npc") || !hasDifficultProperty ) return;
        TokenReplacer.replaceArtWork(document);
        document.update({
            "img": document.data.img,
            "token.img": document.data.token.img,
        });    
    },

    // handle createActor hook
    createActorHook(document, options, userId) {
        // grab the saved values
        TokenReplacer.grabSavedSettings();
        tr_hookedFromTokenCreation = false;

        if (tr_isTRDebug) {
            console.log(`Token Replacer: createActorHook: Data:`, document);        
        }

        let hasDifficultProperty = hasProperty(document.data, tr_difficultyVariable);
        if (!tr_difficultyVariable) {
            // overwrite since it's empty
            hasDifficultProperty = true;
        }

        if ( !tr_replaceToken || (document.data.type !== "npc") || !hasDifficultProperty ) return;
        TokenReplacer.replaceArtWork(document.data);
        document.update({
            "img": document.data.img,
            "token.img": document.data.token.img,
        });
    },

    // handle preCreateToken hook
    preCreateTokenHook(document, options, userId) {
        // if we disabled token replacer on this token, use the token that's there
        if (document.data.flags["token-replacer"] && document.data.flags["token-replacer"].disabled) {
            return;
        }

        // grab the saved values
        TokenReplacer.grabSavedSettings();
        const actor = game.actors.get(document.data.actorId);    

        if (tr_isTRDebug) {
            console.log(`Token Replacer: preCreateTokenHook: Before: TokenData:`, document.data);
            console.log(`Token Replacer: preCreateTokenHook: Before: Actor:`, actor);        
        }

        if (actor) {
            if (tr_isTRDebug) {
                console.log(`Token Replacer: preCreateTokenHook: Before: PassData:`, actor.data);
            }
            tr_hookedFromTokenCreation = true;

            let hasDifficultProperty = hasProperty(actor.data, tr_difficultyVariable);
            if (!tr_difficultyVariable) {
                // overwrite since it's empty
                hasDifficultProperty = true;
            }

            if ( !tr_replaceToken || (actor.data.type !== "npc") || !hasDifficultProperty ) return;
            TokenReplacer.replaceArtWork(actor.data);
            actor.update({
                "img": actor.data.img,
                "token.img": actor.data.token.img,
            });

            if (tr_isTRDebug) {
                console.log(`Token Replacer: preCreateTokenHook: After: TokenData:`, document.data);
                console.log(`Token Replacer: preCreateTokenHook: After: Actor:`, actor);
                console.log(`Token Replacer: preCreateTokenHook: After: PassData:`, actor.data);
            }
        }        
    },

    async createTokenHook(document, options, userId) {
        // if we disabled token replacer on this token, use the token that's there
        if (document.data.flags["token-replacer"] && document.data.flags["token-replacer"].disabled) {
            return;
        }

        const actor = game.actors.get(document.data.actorId);

        if (tr_isTRDebug) {
            console.log(`Token Replacer: createTokenHook: Before: TokenData:`, document.data);
            console.log(`Token Replacer: createTokenHook: Before: Actor:`, actor);        
        }

        if (actor) {
            const token = new Token(document, document._object.scene);
            token.update({"img": actor.data.token.img});

            if (tr_isTRDebug) {
                console.log(`Token Replacer: createTokenHook: After: TokenData:`, document.data);
                console.log(`Token Replacer: createTokenHook: After: Actor:`, actor);        
            }
        }
    },

    // replace the artwork for a NPC actor with the version from this module
    replaceArtWork(data) {
        if (tr_isTRDebug) {
            console.log(`Token Replacer: Replacing Artwork`);        
        }

        const formattedName = escape(data.name.trim().replace(/ /g, tr_imageNameFormat));
        const diffDir = (tr_difficultyName) ? `${String(getProperty(data, tr_difficultyVariable)).replace(".", "_")}/` : "";
        let folderStructure = `${tr_tokenDirectory.current}/${tr_difficultyName}${folderNameFormat}${diffDir}`;

        if (!tr_useStructure) {
            folderStructure = "";
        }

        let tokenCheck = escape(`${folderStructure}${formattedName}`);
        let portraitCheck;

        if (tr_portraitPrefix) {
            portraitCheck = escape(`${folderStructure}${tr_portraitPrefix}${formattedName}`);
        } else {
            portraitCheck = tokenCheck;
        }

        // Update variable values with single forward slash instead of double in case the setting passed in had a
        // trailing slash and we added another in path assembly.
        portraitCheck = portraitCheck.replace("//","/");
        tokenCheck = tokenCheck.replace("//","/");

        const filteredCachedTokens = tr_cachedTokens.filter(t => t.toLowerCase().indexOf(tokenCheck.toLowerCase()) >= 0);
        let filteredCachedPortraits = tr_cachedTokens.filter(t => t.toLowerCase().indexOf(portraitCheck.toLowerCase()) >= 0);
        filteredCachedPortraits = (filteredCachedPortraits) ?? filteredCachedTokens;
        if (!filteredCachedPortraits.length) {
            filteredCachedPortraits = filteredCachedTokens;
        }

        data.token = data.token || {};

        // if we should replace the portrait art and the call is not from PreCreateToken.
        // we only change the art if the art is still the default mystery man
        // otherwise the portrait art will change every time we put a token on the scene
        if (
            (tr_replaceToken === 2 || tr_replaceToken === 3) &&
            (filteredCachedPortraits && filteredCachedPortraits.length > 0)
        ) {
            let randomIdx = Math.floor(Math.random() * (filteredCachedPortraits.length * filteredCachedPortraits.length));
            randomIdx = Math.floor(randomIdx / filteredCachedPortraits.length);
            const portraitSrc = filteredCachedPortraits[randomIdx];

            if (tr_isTRDebug) {
                console.log(`Token Replacer: Replacing portrait art. From: '${data.img}', To: '${portraitSrc}'`);
            }

            data.img = portraitSrc;        
        }

        // we should replace the token art
        if (
            (tr_replaceToken === 1 || tr_replaceToken === 3) &&
            (filteredCachedTokens && filteredCachedTokens.length > 0)        
        ) {
            let randomIdx = Math.floor(Math.random() * (filteredCachedTokens.length * filteredCachedTokens.length));
            randomIdx = Math.floor(randomIdx / filteredCachedTokens.length);
            const tokenSrc = filteredCachedTokens[randomIdx];

            if (tr_isTRDebug) {
                console.log(`Token Replacer: Replacing token art. From: '${data.token.img}', To: '${tokenSrc}'`);
            }

            data.token.img = tokenSrc;
        }
        
        return data;
    }
}


// initialisation
function tokenReplacerInit() {
    console.log("Token Replacer initialising...");

    // hook up events
    TokenReplacer.hookupEvents();
};

// module ready
function tokenReplacerReady() {
    // cache the tokens
    tokenReplacerCacheAvailableFiles();
};

// cache the set of available tokens which can be used to replace artwork to avoid repeated filesystem requests
async function tokenReplacerCacheAvailableFiles() {
    // grab the saved values
    TokenReplacer.grabSavedSettings();

    tr_cachedTokens = [];
    
    if (tr_isTRDebug) {
        console.log(`Token Replacer: Caching root folder: '${tr_tokenDirectory.activeSource}', '${tr_tokenDirectory.current}'`);
    }
    // any files in the root (maybe they didn't want to use subfolders)    
    const rootTokens = await FilePicker.browse(tr_tokenDirectory.activeSource, tr_tokenDirectory.current);
    rootTokens.files.forEach(t => tr_cachedTokens.push(t));

    const folders = await FilePicker.browse(tr_tokenDirectory.activeSource, tr_tokenDirectory.current);
    // any files in subfolders
	for ( let folder of folders.dirs ) {
        if (tr_isTRDebug) {
            console.log(`Token Replacer: Caching folders: '${tr_tokenDirectory.activeSource}', '${folder}'`);
        }
		const tokens = await FilePicker.browse(tr_tokenDirectory.activeSource, folder);
		tokens.files.forEach(t => tr_cachedTokens.push(t));
	}
}

async function registerTokenReplacerSettings() {
    let actor = await Actor.create({
        name: "Dummy NPC",
        type: "npc",    
    });

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

    game.settings.register("token-replacer", "structure", {
        name: game.i18n.localize("TR.Structure.Name"),
        hint: game.i18n.localize("TR.Structure.Hint"),
        scope: 'world',
        type: Boolean,
        default: tr_useStructureDefault,
        config: true,
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
        default: `[data] ${tr_tokenPathDefault}`,
    });

    // token subdirectory path setting
    game.settings.register("token-replacer", "difficultyName", {
        name: game.i18n.localize("TR.DifficultyName.Name"),
        hint: game.i18n.localize("TR.DifficultyName.Name"),
        scope: "world",
        config: false,
        type: String,
        default: tr_difficultyNameDefault,
    });

    game.settings.register("token-replacer", "difficultyVariable", {
        name: game.i18n.localize("TR.DifficultyVariable.Name"),
        hint: game.i18n.localize("TR.DifficultyVariable.Name"),
        scope: "world",
        config: false,
        type: String,
        default: tr_difficultyVariableDefault,
    });

    game.settings.register("token-replacer", "portraitPrefix", {
        name: game.i18n.localize("TR.PortraitPrefix.Name"),
        hint: game.i18n.localize("TR.PortraitPrefix.Name"),
        scope: "world",
        config: false,
        type: String,
        default: tr_portraitPrefixDefault,
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

function createImageFormat(selected) {
    tr_nameFormats = [            
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
        tr_nameFormats[selected].selected = true;
    }        
}

function createFolderFormat(selected) {
    tr_folderFormats = [
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
        tr_folderFormats[selected].selected = true;
    }        
}

Hooks.on("renderTokenReplacerSetup", (app, html, user) => {
    DirectoryPicker.processHtml(html);
});
Hooks.on("renderSettingsConfig", (app, html, user) => {
    DirectoryPicker.processHtml(html);
});
Hooks.once("init", tokenReplacerInit);
Hooks.once("ready", registerTokenReplacerSettings);
Hooks.on("ready", tokenReplacerReady);
