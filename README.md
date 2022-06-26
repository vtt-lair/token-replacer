![Latest Release Download Count](https://img.shields.io/badge/dynamic/json?color=blue&label=Downloads%40latest&query=assets%5B1%5D.download_count&url=https%3A%2F%2Fapi.github.com%2Frepos%2Fvtt-lair%2Ftoken-replacer%2Freleases%2Flatest) [![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Ftoken-replacer&colorB=4aa94a)](https://forge-vtt.com/bazaar#package=token-replacer) 
![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Fvtt-lair%2Ftoken-replacer%2Fmaster%2Fmodule.json&label=Foundry%20Version&query=$.compatibleCoreVersion&colorB=orange)

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/N4N36ZSPQ)



# Token Replacer
Automatically replace NPC actor tokens and/or portraits dependent on token assets saved in a defined folder structure. Allows randomisation of token artwork, if more
than one file per creature is added.

## Settings
### System Settings Tab
#### Automatically replace NPC actor artwork
This is where you enable or disable the token/portrait replacement. There are 4 options available
* Disabled - do not do any token or portrait replacement
* Replace token artwork - just replace the token artwork. This will happen when pulling an NPC from a compendium or from the 'Actors Directory'
* Replace portrait artwork - same as above only just replace the portrait artwork.
* Replace token& portrait artwork - combine the 2 options above.

### Structure Tab
#### Folder Structure
How you're images are organised. 1) Root: Images are all saved in the directory specified below. 2) Defined Structure: Images are all saved in subdirectories specified by a defined variable (like CR for example). 3) Undefined Structure: Images are all saved in subdirectories that's not controlled by a defined variable.   
*Warning* Using 'Root' or 'Undefined Structure' could cause wrong images to be used for an actor/token for e.g. placing a 'Wolf' and just checking against the name a 'Wolf Spider' image instead.

#### Token Directory
Place where your tokens are saved. These can't be stored in your root data folder, create a place for them to live. Defaults to the free Forgotten Adventures tokens. It's however advised to change this directory to something NOT in the modules directory as new versions will overwrite any tokens you manually saved there.

#### Defined Structure Prefix
The name used in your system (defaults to 'cr' for DnD 5e) that you prefix your subfolders with. Token art should be put under folders named after this measurement and is case sensitive (eg. the cr1 subfolder should have all cr1 tokens). Leaving this empty will mean you need to save the images in the root of the tokens path and not in subfolders and the 'Defined Structure Variable' is not checked to figure out subfolder structures.

#### Defined Structure Variable
The defined structure variable used in the actor's data (defaults to DnD 5e's). This is dependant on whether you entered an 'Defined Structure Prefix'. If you are unsure what the variable is, leave 'Defined Structure Prefix' empty and save everyting into the root folder.

### Formatting Tab
#### Portrait Prefix
The prefix used to define images that should be used when replacing portraits, instead of a token image. This is used if you want to specify a specific artwork that should be used for the portrait replacement. It uses the prefix exactly as you define it, i.e. if you use "prefix", the the file needs to be called "prefixDeep_Scion.png", if you use "p_" for instance, th file name has to be "p_Deep_Scion.png".

#### Image Name Format
The way the image is formatted. 
* 'Proper English' uses spaces between words.
* 'Underscored' uses underscores '_' between words.
* 'Dashed' uses dashes '-' between words.

#### Folder Name Format
The way the difficulty folder is formatted. 
* 'No Space' uses no spaces in the folder name.
* 'Proper English' uses spaces between words.
* 'Underscored' uses underscores '_' between words.
* 'Dashed' uses dashes '-' between words.

#### Scale Name
The wording in the image name that determines the scale the token should be set to. If the file name is 'Pit_Fiend_Large_Scale200', then you would set the variable to 'scale' and the token will be scaled to be 200%.

### Tokenizer Tab
#### Fallback to MrPrimate's Tokenizer
If no image is found for a token, fallback to MrPrimate's Tokenizer. This will be a manual process, the Tokenizer screen will shown and you can set the portrait and token image of the actor.

#### Prompt before showing Tokenizer
A prompt will show asking whether you want to use MrPrimate's Tokenizer. Leave this unticked to always show the Tokenizer screen if no token replacement image is found.

## Disable Token Replacer for a Token
On the actor, click on Prototype Token in the title bar. Select the Image tab, then at the bottom of the form there will be a checkbox where you can disable token replacer for the Prototype Token. If it's disabled this means the artwork will never automatically be replaced. The portrait or token art can still be manually set, however token replacer won't look for artwork going forward.

![Token Replacer Disabler](https://github.com/vtt-lair/token-replacer/blob/main/example/disabler.jpg "Token Replacer Disabler")

## Tokens
Save the tokens either in the root folder (if Root structure is selected) OR to the subfolder structure specified in the settings (if Defined Structure) OR any subfolder structure (if Undefined Structure is selected.)

Token file names need to be in the format as specified on the formatting tab.
If no artwork is found for the creature, it will use the artwork already linked to that actor.

> Tokens found in the module are free tokens supplied by **Forgotten Adventures**: [Patreon](https://www.patreon.com/forgottenadventures) [Website](https://www.forgotten-adventures.net/). If you would like to use them, please move them out to your own token folder.

![Token Replacer in Action](https://github.com/vtt-lair/token-replacer/blob/main/example/Token-Replacer.gif "Token Replacer in Action")

The settings in the gif is old.
