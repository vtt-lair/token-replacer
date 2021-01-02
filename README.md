# Token Replacer
Automatically replace NPC actor tokens and/or portraits dependent on token assets saved in a defined folder structure. Allows randomisation of token artwork, if more
than one file per creature is added.

## Setup
#### Automatically replace NPC actor artwork
This is where you enable or disable the token/portrait replacement. There are 4 options available
* Disabled - do not do any token or portrait replacement
* Replace token artwork - just replace the token artwork. This will happen when pulling an NPC from a compendium or from the 'Actors Directory'
* Replace portrait artwork - same as above only just replace the portrait artwork.
* Replace token& portrait artwork - combine the 2 options above.

### NPC Difficulty Name
This is what is used in your game system to differentiate between the difficulty of creatures. This is specifically for organisational purposes. In the token folder, you can create subfolders according to difficulty levels and organise the token art. The value defaults to 'cr' (DnD 5e). If you change the value to something else
the subfolders in the token folder will have to reflect the same. Clearing this value means the module will just check under the root token folder and not worry about
subfolders.

### NPC Difficulty Variable
The variable used by the game system you are using. It's used to see what difficulty level the creature is, in order to figure out in which subfolder the figure can be found. If 'NPC Difficulty Name' is empty, this won't be checked.

## Tokens
Tokens can be saved to `modules/token-replacer/tokens/`. Save the tokens either in the root folder (and make sure 'NPC Difficulty Name' is empty) or to it subsuquent 
subfolder (dependent on creature difficulty level).

Token file names need to start with the creature name and spaces in names need to be replaced by underscores ('_'). In order to randomise token artwork, more than one file can be supplied as long as the file name starts with the creature name eg 'Dire_Wolf_1.png', 'Dire_Wolf_2.png', 'Dire_Wolf_Black.png'. The randomisation only happens with token art and not portrait art.

If no artwork is found for the creature, it will use the artwork already linked to that actor.

## Known Issues
* Manually creating actor from the 'Actors Directory', first time adding the actor to the scene will show the original token. 
* After closing a newly manually created actor, even if you've put the actor in the scene. The token will again revert to original, until you've added a 2nd one.
