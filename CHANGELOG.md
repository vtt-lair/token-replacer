
# 0.6.4

* Add way to handle different NPC types for systems that doesn't use "npc" as a type specifyer. - thanks @tuirgin

# 0.6.3

* Fix module to not try to replace Item Piles with token artwork
* Fixed an issue where the token wasn't updating when using MrPrimate's Tokenizer
* Fixed issue where disabling token replacer for a specific token via the token config screen, wasn't showing this setting

# 0.6.2

* Fix settings to work with v9

# 0.6.1

* Change update code to use document#update instead for v9 compatibility
* Wrap the MrPrimate Tokenizer call so that only GM can do it

# 0.6.0

* Fix bug where not entering a portrait prefix caused the token replacement to fail
* Added functionality to use MrPrimate's Tokenizer module as a fallback if no replacement token image is found.

# 0.5.5

* Fix bug where the replace token dropdown setting wasn't being saved

# 0.5.4

* Fix debug logging issue when saving settings

# 0.5.3

* Add functionality to Defined Structure Variable to have a list to choose from. Currently only have variables for 5e. Any non 5e system will still have to manually define the variable.

# 0.5.2

* Fix proper english check that was being replaced by double escape characters - @kageru
* Fix check if not using defined strucutre - @kageru
* Add extra debug logging - @kageru
* Change settings menu structure to have beter UX
* Change the NPC Difficulty Structure to rather be a dropdown box with 3 choices
    * Root - all images are saved directly in the root (previously unticked NPC Difficulty Structure setting)
    * Defined Structure - uses a defined structure using a variable setting from the actor (like CR for instance)
    * Undefined Structure - have subfolders that's not defined by an actor variable.

# 0.5.1

* Refactor code to ensure clashing with other modules won't happen

# 0.5.0

* Migrate module to 0.8.x
* Change the way tokens and actors hook events are handled
* Change the way tokens are created
* Change the way tokens and actors are updated

# 0.4.4

* Fixed an issue with saving settings when 'Use NPC Difficulty Folder Structure' is unchecked
* Removed the mystery man check for portrait on token creation, since we have a portrait prefix to force portraits to one specific image

# 0.4.3

* Rename debug variable to more unique name as it causes issue with other modules

# 0.4.2

* Add a way to disable token replacer from replacing a token.

# 0.4.1

* Fix an issue where compendium actor's token image is overwritten with mystery man when no token image is found.

# v0.4.0

* Fix an issue when trying to update image on newly created actor, specifically one dragged from a compendium.
* Added functionality to ignore the difficulty when structuring the folders the images are saved in. This way, you can use your own structure but with the small drawback of possibly using incorrect image for a token.
* Added the functionality to define how your folder and file names are formatted.

# v0.3.0

* Add localisation, for future languages.
* Remove double slashes from path in case user adds a trailing dash in the token directory setting. - @etriebe
* Add defensive checks around actor data when trying to update actor.
* Add debug flag and console logs dependent on debug flag

# v0.2.3

* Fixed bug where if Replace token & portrait art was selected, and a portrait prefix was specified. And no image was found with the portrait prefix, it didn't fall back to the normal token art and then caused neither the token nor the art to be changed.
# v 0.2.2

* Fix bug where when using The Forge's Assest Library, it wasn't grabbing the images correctly.
* If you opted in for portrait art replacement, and created a new actor. The portrait wasn't being updated for the actor.
* Fix the issue where, when adding an actor's token for the first time (especially newly created actors), it didn't update the token the first time. Only the second time and onwards.
* Artificially increased the randomisation pool, to try and get better randomisation.
* Added the Portrait Prefix setting, if you want to have a specific image as the portrait
* Trimmed the image names when building the formatted name - @kageru

# v 0.2.1

* Fix bug when trying to clear Difficulty Name

# v 0.2.0

* Change configuration settings to have a setting menu.
    * Add new token directory input, so that users can specify their own token directory outside of the module folder. This is advised.
    * Add error handling for Token Directory, NPC Difficulty Name and NPC Difficulty Variable.
* Add this changelog file.
* Handle special characters in file names.

# v 0.1.2

* Make sure to update the token and actor data after changing the art work.

# v 0.1.1

* Fix CR 1/2 token subfolder from cr0_50 ot cr0_5. 

# v 0.1.0

* Initial release
