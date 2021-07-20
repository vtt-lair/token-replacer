![Previous Release Download Count](https://img.shields.io/badge/dynamic/json?label=Downloads@v0.4.4%20(for%200.7.9)&query=assets%5B1%5D.download_count&url=https%3A%2F%2Fapi.github.com%2Frepos%2Fvtt-lair%2Ftoken-replacer%2Freleases%2F42496894) [![Manifest for Foundry VTT 0.7.9](https://img.shields.io/badge/Manifest%20for%20Foundry%20VTT-0.7.9-blue)](https://github.com/vtt-lair/token-replacer/releases/download/v0.4.4/module.json)

![Latest Release Download Count](https://img.shields.io/badge/dynamic/json?color=blue&label=Downloads%40latest&query=assets%5B1%5D.download_count&url=https%3A%2F%2Fapi.github.com%2Frepos%2Fvtt-lair%2Ftoken-replacer%2Freleases%2Flatest) [![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Ftoken-replacer&colorB=4aa94a)](https://forge-vtt.com/bazaar#package=token-replacer) 
![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Fvtt-lair%2Ftoken-replacer%2Fmaster%2Fmodule.json&label=Foundry%20Version&query=$.compatibleCoreVersion&colorB=orange)



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

### Structure
#### Folder Structure
How you're images are organised. 1) Root: Images are all saved in the directory specified below. 2) Defined Structure: Images are all saved in subdirectories specified by a defined variable (like CR for example). 3) Undefined Structure: Images are all saved in subdirectories that's not controlled by a defined variable.   
*Warning* Using 'Root' or 'Undefined Structure' could cause wrong images to be used for an actor/token for e.g. placing a 'Wolf' and just checking against the name a 'Wolf Spider' image instead.

#### Token Directory
Place where your tokens are saved. These can't be stored in your root data folder, create a place for them to live. Defaults to the free Forgotten Adventures tokens. It's however advised to change this directory to something NOT in the modules directory as new versions will overwrite any tokens you manually saved there.

#### Defined Structure Prefix
The name used in your system (defaults to 'cr' for DnD 5e) that you prefix your subfolders with. Token art should be put under folders named after this measurement and is case sensitive (eg. the cr1 subfolder should have all cr1 tokens). Leaving this empty will mean you need to save the images in the root of the tokens path and not in subfolders and the 'Defined Structure Variable' is not checked to figure out subfolder structures.

#### Defined Structure Variable
The defined structure variable used in the actor's data (defaults to DnD 5e's). This is dependant on whether you entered an 'Defined Structure Prefix'. If you are unsure what the variable is, leave 'Defined Structure Prefix' empty and save everyting into the root folder.

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


## Disable Token Replacer for a Token
On the actor, click on Prototype Token in the title bar. Select the Image tab, then at the bottom of the form there will be a checkbox where you can disable token replacer for the Prototype Token. If it's disabled this means the artwork will never automatically be replaced. The portrait or token art can still be manually set, however token replacer won't look for artwork going forward.

![Token Replacer Disabler](https://github.com/Werner-Dohse/token-replacer/blob/main/example/token-replacer-disabler.jpg "Token Replacer Disabler")

## Tokens
Tokens can be saved to `modules/token-replacer/tokens/`. Save the tokens either in the root folder (and make sure 'NPC Difficulty Name' is empty) or to it subsuquent 
subfolder (dependent on creature difficulty level).

Token file names need to start with the creature name and spaces in names need to be replaced by underscores ('_'). In order to randomise token artwork, more than one file can be supplied as long as the file name starts with the creature name eg 'Dire_Wolf_1.png', 'Dire_Wolf_2.png', 'Dire_Wolf_Black.png'. The randomisation only happens with token art and not portrait art.

If no artwork is found for the creature, it will use the artwork already linked to that actor.

> Tokens found in the module are free tokens supplied by **Forgotten Adventures**: [Patreon](https://www.patreon.com/forgottenadventures) [Website](https://www.forgotten-adventures.net/)

![Token Replacer in Action](https://github.com/Werner-Dohse/token-replacer/blob/main/example/Token-Replacer.gif "Token Replacer in Action")