# v0.3.0

* Add localisation, for future languages.
* Remove double slashes from path in case user adds a trailing dash in the token directory setting. - @etriebe
* Add defensive checks around actor data when trying to update actor.
* Add debug flag and console logs dependant on debug flag

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
