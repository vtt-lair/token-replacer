const tokenPath = "modules/token-replacer/tokens/";
const difficultyNameDefault = "cr";
const difficultyVariableDefault = "data.details.cr";

let cachedTokens = [];
let replaceToken;
let difficultyName;
let difficultyVariable;
let hookedFromTokenCreation = false;

function init() {
    console.log("Token Replacer initialising...");
    
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

    // token path setting
    game.settings.register("token-replacer", "difficultyName", {
        name: "NPC Difficulty Name",
        hint: "The difficulty measurement name used in your system (defaults to 'cr' for DnD 5e). " + 
            "Token art should be put under folders named after this measurement and is case sensitive (the cr1 subfolder should have all cr1 tokens). " + 
            "Leaving this empty will mean you need to save the images in the root of the tokens path and not in subfolders and the 'NPC Difficulty Variable' is not checked to figure out subfolder structures.",
        scope: "world",
        config: true,
        type: String,
        default: difficultyNameDefault,
    });

    game.settings.register("token-replacer", "difficultyVariable", {
        name: "NPC Difficulty Variable",
        hint: "The difficulty measurement variable used in the actor's data (defaults to DnD 5e's). This is dependant on whether you entered an 'NPC Difficulty Name'. " + 
            "If you are unsure what the variable is, leave 'NPC Difficulty Name' empty and save everyting into the root folder.",
        scope: "world",
        config: true,
        type: String,
        default: difficultyVariableDefault,
    });

    // setup hook for replacement before and during actor creation
    Hooks.on("preCreateActor", preCreateActorHook);
    Hooks.on("createActor", createActorHook);    
    
    // make sure we change the image each time we drag a token from the actors
    Hooks.on("preCreateToken", preCreateTokenHook);    

    // cache the tokens
    cacheAvailableTokens();    
}

// grab the already saved settings
function grabSavedSettings() {
    replaceToken = game.settings.get("token-replacer", "replaceToken") ?? 0;
    difficultyName = game.settings.get("token-replacer", "difficultyName");
    difficultyVariable = game.settings.get("token-replacer", "difficultyVariable");
}

// cache the set of available tokens which can be used to replace artwork to avoid repeated filesystem requests
async function cacheAvailableTokens() {
    cachedTokens = [];
    
    // any files in the root (maybe they didn't want to use subfolders)
    const rootTokens = await FilePicker.browse("data", tokenPath);
    rootTokens.files.forEach(t => cachedTokens.push(t));

    const folders = await FilePicker.browse("data", tokenPath);
    // any files in subfolders
	for ( let folder of folders.dirs ) {
		const tokens = await FilePicker.browse("data", folder);
		tokens.files.forEach(t => cachedTokens.push(t));
	}
}

// handle preCreateActor hook
function preCreateActorHook(data, options, userId) {
    // grab the saved values
    grabSavedSettings();
    hookedFromTokenCreation = false;

    if ( !replaceToken || (data.type !== "npc") || !hasProperty(data, difficultyVariable) ) return;
    replaceArtWork(data);
}

// handle createActor hook
function createActorHook(data, options, userId) {
    // grab the saved values
    grabSavedSettings();
    const passData = data.data;
    hookedFromTokenCreation = false;

    if ( !replaceToken || (passData.type !== "npc") || !hasProperty(passData, difficultyVariable) ) return;
    replaceArtWork(passData);
}

// handle preCreateToken hook
function preCreateTokenHook(data, options, userId) {
    // grab the saved values
    grabSavedSettings();
    const actor = game.actors.get(options.actorId);
    const passData = actor.data;
    hookedFromTokenCreation = true;

    if ( !replaceToken || (passData.type !== "npc") || !hasProperty(passData, difficultyVariable) ) return;
    replaceArtWork(passData);
}

// replace the artwork for a NPC actor with the version from this module
function replaceArtWork(data) {
    const cleanName = data.name.replace(/ /g, "_");
	const diffDir = (difficultyName) ? `${String(getProperty(data, difficultyVariable)).replace(".", "_")}/` : "";
    const tokenCheck = `${tokenPath}${difficultyName}${diffDir}${cleanName}`;
    
    const filteredCachedTokens = cachedTokens.filter(t => t.indexOf(tokenCheck) >= 0);
    if (!filteredCachedTokens || (filteredCachedTokens && !filteredCachedTokens.length)) return;

    if (filteredCachedTokens && filteredCachedTokens.length) {
        const randomIdx = Math.floor(Math.random() * (filteredCachedTokens.length - 1));
        const tokenSrc = filteredCachedTokens[randomIdx];

        data.token = data.token || {};
        // if we should replace the portrait art and the call is not from PreCreateToken.
        // we dont' run from PreCreateToken, otherwise the portrait art will change
        // every time we put a token on the scene
        if (replaceToken === 2 || replaceToken === 3 && !hookedFromTokenCreation) {
            data.img = tokenSrc;
        }
        // we should replace the token art
        if (replaceToken === 1 || replaceToken === 3) {
            data.token.img = tokenSrc;
        }	
    }
    
    return data;
}

// Initialize module
Hooks.on("init", init);