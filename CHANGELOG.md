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
