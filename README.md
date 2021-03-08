# Token Replacer
Automatically replace NPC actor tokens and/or portraits dependent on token assets saved in a defined folder structure. Allows randomisation of token artwork, if more
than one file per creature is added.

## Setup
### Automatically replace NPC actor artwork
This is where you enable or disable the token/portrait replacement. There are 4 options available
* Disabled - do not do any token or portrait replacement
* Replace token artwork - just replace the token artwork. This will happen when pulling an NPC from a compendium or from the 'Actors Directory'
* Replace portrait artwork - same as above only just replace the portrait artwork.
* Replace token& portrait artwork - combine the 2 options above.

### Use NPC Difficulty Folder Structure
This is to indicate whether you are structuring the art work into folders defined by the difficulty level of the NPC (NPC Difficulty Name below). 
*Warning* Using a structure not defined by the difficulty could cause wrong images to be used for an actor/token for e.g. placing a 'Wolf' and just checking against the name without the difficulty could place a 'Wolf Spider' token instead.

### Settings
#### Token Directory
Place where your tokens are saved. These can't be stored in your root data folder, create a place for them to live. Defaults to the free Forgotten Adventures tokens. It's however advised to change this directory to something NOT in the modules directory as new versions will overwrite any tokens you manually saved there.

#### NPC Difficulty Name
This is what is used in your game system to differentiate between the difficulty of creatures. This is specifically for organisational purposes. In the token folder, you can create subfolders according to difficulty levels and organise the token art. The value defaults to 'cr' (DnD 5e). If you change the value to something else
the subfolders in the token folder will have to reflect the same. Clearing this value means the module will just check under the root token folder and not worry about
subfolders.

#### NPC Difficulty Variable
The variable used by the game system you are using. It's used to see what difficulty level the creature is, in order to figure out in which subfolder the figure can be found. If 'NPC Difficulty Name' is empty, this won't be checked.

#### Portrait Prefix
The prefix used to define images that should be used when replacing portraits, instead of a token image. This is used if you want to specify a specific artwork that should be used for the portrait replacement. It uses the prefix exactly as you define it, i.e. if you use "prefix", the the file needs to be called "prefixDeep_Scion.png", if you use "p_" for instance, th file name has to be "p_Deep_Scion.png".

#### Folder Name Format
The way the difficulty folder is formatted. 
* 'No Space' uses no spaces in the folder name.
* 'Proper English' uses spaces between words.
* 'Underscored' uses underscores '_' between words.
* 'Dashed' uses dashes '-' between words.

#### Image Name Format
The way the image is formatted. 
* 'Proper English' uses spaces between words.
* 'Underscored' uses underscores '_' between words.
* 'Dashed' uses dashes '-' between words.

## Disable Token Replacer for a Token
On the actor, click on Prototype Token in the title bar. Select the Image tab, then at the bottom of the form there will be a checkbox where you can disable token replacer for the Prototype Token. If it's disabled this means the artwork will never automatically be replaced. The portrait or token art can still be manually set, however token replacer won't look for artwork going forward.

## Tokens
Tokens can be saved to `modules/token-replacer/tokens/`. Save the tokens either in the root folder (and make sure 'NPC Difficulty Name' is empty) or to it subsuquent 
subfolder (dependent on creature difficulty level).

Token file names need to start with the creature name and spaces in names need to be replaced by underscores ('_'). In order to randomise token artwork, more than one file can be supplied as long as the file name starts with the creature name eg 'Dire_Wolf_1.png', 'Dire_Wolf_2.png', 'Dire_Wolf_Black.png'. The randomisation only happens with token art and not portrait art.

If no artwork is found for the creature, it will use the artwork already linked to that actor.

> Tokens found in the module are free tokens supplied by **Forgotten Adventures**: [Patreon](https://www.patreon.com/forgottenadventures) [Website](https://www.forgotten-adventures.net/)

![Token Replacer in Action](https://github.com/Werner-Dohse/token-replacer/blob/main/example/Token-Replacer.gif "Token Replacer in Action")