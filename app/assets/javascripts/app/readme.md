# Bookmarklet and Extension

Assets:

* 
radar.js a list of JST's selected in assets/javascript/radar.js
Some of the JST's are used in both the web app and the extension.
All of the JST's that don't begin with bookmarklet is used in the web app also. 


* radar.css is a list of partials in assets/stylesheet/radar.scss
All of the css but _bookmarklet_overwrite.scss is also used in the web app.
In radar.scss, there is also some scss meant to reset the css in `.ext-elements`

* jquery


The bookmarklet is split into sections

* ShelbyRadar
This includes code to find the videos on the page by finding the provider name and provider id.
* ShelbyUtil
This includes code to set up the buttons, click events, notifications, and api calls.
ShelbyAjaxCalls has a collection of functions for api calls.
ShelbyContextButton has a collection of click events
ShelbyHtmlTemplate access the JST functions and creates all the fake models in order for the JST's to work.

## Code flow:

* loadBookmarklet is called
* shelbyInit is called and is given a function that generates options
* fullFunc loads everything that is needed and then starts finding the videos by constructing a radar object.
* shelbify takes the radar object, finds the videos and sets up the buttons

In addition there is a a listener on history, so that if the url changes, it'll look for videos once again, using the url to find videos. This is primarily for college humor. The logic is, if the url does change the video content, then the page is primarily for the video, and the information is in the url. This is because for college humor, the video information isn't in the video embed after the url changes.

Also there is a listener on click events that looks for more videos on each click.
