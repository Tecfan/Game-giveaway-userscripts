// ==UserScript==
// @name         Steamgifts visited
// @namespace    http://tampermonkey.net/
// @version      1.0
// @updateURL    https://github.com/Tecfan/Game-giveaway-userscripts/raw/master/Steamgifts%20visited.user.js
// @downloadURL  https://github.com/Tecfan/Game-giveaway-userscripts/raw/master/Steamgifts%20visited.user.js
// @description  Make all visited links om Steamgifts.com red.
// @author       Tecfan
// @match        https://www.steamgifts.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    /* It's very hard to keep track of what links in the Deals or the itch.io free games thread you have
       already opened. This script makes every link you have already opened a very bright red color, so
       that you can be sure that the itch.io claimable game you see linked is something you don't already
       own. It's not pretty, but it works.                                                               */

    /* Function to add style */
    function addStyle(styles) {

        /* Create style element */
        var css = document.createElement('style');
        css.type = 'text/css';

        if (css.styleSheet) {
            css.styleSheet.cssText = styles;
        }
        else {
            css.appendChild(document.createTextNode(styles));

            /* Append style to the head element */
            document.getElementsByTagName("head")[0].appendChild(css);
        }
    }

    /* Declare the style element */
    var styles = 'a:visited { color: red }';

    /* Function call */
    window.onload = function() {
        addStyle(styles)
    }
    ;
}
)();
