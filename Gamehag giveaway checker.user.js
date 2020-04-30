// ==UserScript==
// @name         Gamehag giveaway checker
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Check old Gamehag giweaways if they are still active.
// @author       Tecfan
// @match        https://gamehag.com/giveaway/*
// @grant        none
// ==/UserScript==

(function() {
    "use strict";
    /* Change this to 0 if you do not want to skip giveaway pages which you have already completed. This
       can be useful in some cases, but it will be hard for you to verify if the giveaway is actually
       functional unless you create a new user with another IP.                                          */
    var skipCompleted = 1;

    /* Array with all the bad giveaway pages that look like they will work, but has manually been tested to not work.
       They do not work either because it gives the error: "No more keys left", or because one of the tasks does not
       work (like joining the Gamehag Steam group), or because it's a shitty in-game item code which is not worth our time. */
    var errorGws = [123, 125, 128, 131, 234, 258, 295, 321, 338, 343, 353, 365, 533, 535, 541, 549, 553, 554, 584, 586, 588, 
                   636, 670, 692, 693, 696, 705, 712, 716, 785];

    // Declaring some variables because for some reason Gamehag.com doesn't allow me to declare them inside the loops in my script.
    var z = 0
      , aelem = 0
      , divelem = 0;

    // y = giveaway-number (gamehag.com/giveaway/y)
    var y = location.href.match(/\d+$/);

    // /giveaway/38 redirects instantly to another page, so have to filter it out manually, jumpping directly to /giveaway/39.
    if (y == 37) {
        var x = 39;
    } else {
        // Have to do it like this, there's some weirdness on Gamehag. x = y + 1, in other words: the next giveaway.
        var x = y;
        x = ++x;
    }

    // A place to post error messages from this script.
    var errorMesssageHeader = document.querySelector("div.giveaway-avatar > h1");

    // Place to check for the "Giveaway has ended" error message
    var gwEnded = document.querySelectorAll("div.giveaway-content > div");

    // Return this function when the script has reached the last giveaway.
    var endOfScript = function() {
        console.log("You've reached an upcoming giveaway, script aborted.");
        errorMesssageHeader.insertAdjacentHTML("beforeend", '<br><span style="background-color: red; font-size: 60%;">You\'ve reach the end.<br>Userscript aborted.<\/span>');
    }

    // Function to open the next giveaway
    var openNextPage = function() {
        window.open(`https://gamehag.com/giveaway/${x}`, "_self");
    }

    // Check if we are currently on one of the bad giveaway pages listed in the array "errorGws"
    for (z = 0; z < errorGws.length; z++) {
        if (errorGws[z] == y) {
            console.log("There are keys left, but the giveaway has been manually filtered out because it gives an error message or a non-Steam item. Sending you to the next page.");
            return openNextPage();
        }
    }

    /* Check if the giveaway includes an error message that says that the giveaway can only be completed
       on a mobile phone. onlyMobile will be either true or false if the error message exists            */
    var mobile = document.querySelectorAll("div.single-giveaway-task > div.task-content > a");
    var onlyMobile = document.querySelector("div.giveaway-content > div.alert.alert-warning.text-center");
    if (onlyMobile) {
        onlyMobile = onlyMobile.innerText.includes("only on our mobile");
    }

    // Check if the user wants to skip completed giveaways or not.
    // Default setting is 1. Set the alreadyComplete variable which will be used later and continue the script.
    if (skipCompleted === 1) {
        var alreadyComplete = document.querySelector("div.giveaway-key");
        if (alreadyComplete) {
            // Not sure why I'm doing it like this. Any suggestions?
            alreadyComplete = alreadyComplete.getAttribute("style");
        }
    }
    // If setting is set to 0, stop the script and post a message to the user.
    else if (skipCompleted === 0) {
        errorMesssageHeader.insertAdjacentHTML("beforeend", '<br><span style="background-color: red; font-size: 60%;">Giveaway possibly functional,<br>but you have already completed it.<br>Script stopped due to your "skipCompleted" setting.<\/span>');
        return console.log('Giveaway possibly functional, but you have already completed it. Script stopped due to your "skipCompleted" setting.');
    }
    // If it's set wrongly, return an error message an stop the script.
    else {
        errorMesssageHeader.insertAdjacentHTML("beforeend", '<br><span style="background-color: red; font-size: 60%;">Error with "skipCompleted" variable.<br>see the first line in the userscript.<br>Value should be either "0" or "1".<\/span>');
        return console.log('Error with "skipCompleted" variable, see the first line in the userscript. Value should be either "0" or "1"');
    }

    /* Insert link to next giveaway page so that you don't have to edit URL manually when the script stops.
       Opens in new tab so that the userscript starts properly. Any other way of making sure the userscript
       will run after a normal URL click?                                                                  */
    document.querySelector("div.giveaway-games > h3").insertAdjacentHTML("beforebegin", `<h3 class="text-xs-center mb-3"> <a href="https://gamehag.com/giveaway/${x}" target="_blank">Next giveaway</a></h3>`);

    // if there is a giveaway counter on the page, start the script
    if (document.getElementsByClassName("giveaway-counter")[0]) {

        // Get the number of remaining keys in the giveaway
        var gwc = document.querySelector("div.giveaway-counter:nth-child(1) > div").innerHTML;

        /* If there's more than 1 key left, and the giveaway is not for mobiles only, and if the CD
           key is hidden (aka giveaway is not yet completed, then go further in the script         */
        if (gwc > 1 && onlyMobile === false && alreadyComplete == "display:none") {

            /* For each task on the page, check if it includes the words "Zone" (an old task type for mobiles),
               OR if it includes the words "the survey", which is a task that requires you to finish a very
               limited set of surveys that are hard to complete as it's very easy to fall out of their intended
               target group, and there's generally only one survey available, then open the next page.          */
            for (aelem = 0; aelem < mobile.length; aelem++) {
                if (mobile[aelem].innerText.includes("Zone") || mobile[aelem].innerText.includes("the survey")) {
                    return openNextPage();
                }
            }

            /* If you survived the first for loop, then check a div under the tasks if the giveaway error is either "not
               available in your country" OR the giveaway has ended. If this is true, then just open the next page.     */
            for (divelem = 0; divelem < gwEnded.length; divelem++) {
                if (gwEnded[divelem].innerText.includes("not available in your country") || gwEnded[divelem].innerText.includes("has ended")) {
                    return openNextPage();
                }
                /* Or else, check if the giveaway is in the future and abort the script (not sure if this will ever be true) */
                else if (gwEnded[divelem].innerText.includes("Giveaway has not yet taken off")) {
                    return endOfScript();
                }
            }

            return console.log("This giveaway is probably still active");
        }
        /* If the main arguments are not true, and a message saying that the giveaway is in the future
           is visible, then abort the script.                                                          */
        else if (gwEnded[1].innerText.includes("Giveaway has not yet taken off")) {
            return endOfScript();
        }
        // In any other case, the giveaway is surely not active, so open the next giveaway and restart the script by reloading the page.
        else {
            return openNextPage();
        }
    } else {
        return alert("Error with script or giveaway");
    }

}
)();
