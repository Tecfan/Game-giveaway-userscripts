// ==UserScript==
// @name         Add free games to account
// @namespace    http://tampermonkey.net/
// @version      0.11
// @updateURL    https://github.com/Tecfan/Game-giveaway-userscripts/blob/master/Add%20free%20games%20to%20account.user.js
// @downloadURL  https://github.com/Tecfan/Game-giveaway-userscripts/blob/master/Add%20free%20games%20to%20account.user.js
// @description  This script will attempt to add all free items from certain stores to your account automatically.
// @author       Tecfan
// @match        https://store.playstation.com/*/grid/*
// @match        https://store.playstation.com/*/checkout*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

/* Before you run it you should know that I do not take any responsibility for whatever happens when you run this script.
   I do not know if this is against Sony's EULA. As a precaution you should also remove all payment methods from your account –
   the script will not continue if it sees that there is something non-free in your basket, 
   but you can never be too sure as this is a fully automatic bot.*/

// Read the "README" file on Github for instructions on how to use this script.

// A timeout function (needed because PS Store is wonky with the loading of elements)
var timeoutPal = (ms)=>new Promise(resolve=>setTimeout(resolve, ms));

(async function() {
    "use strict";
    await timeoutPal(7000);

    var cartItems = 0
      , nonFreeOffset = 0
      , paidPages = 0
      , i = 0;

    // This function checks if we're on /checkout, /confirm or not. If not, we are on /*/grid/*, as this is the only other place the script will start.
    var whereAreWe = function() {
        var checkURL = window.location.pathname.split("/");

        // For loop counting downwards and starting the check from the last URL elements. 
        for (var yy = checkURL.length; yy > 0; yy--) {
            if (checkURL[yy - 1].match(/confirm/)) {
                return "confirm";
            } else if (checkURL[yy - 1].match(/checkout/)) {
                return "checkout";
            }
        }

        return "grid";
    }

    // Function to check if a string has a number in it (used to check if a game is free or not)
    function hasNumber(priceDisplay) {
        return /\d/.test(priceDisplay);
    }

    // Function to check the number of items in the shopping cart
    var cartNumber = function() {
        // If the number exists, return the number in the variable "cartItems"
        if (document.getElementsByClassName("icon-nav__count--cart")[0]) {
            cartItems = document.getElementsByClassName("icon-nav__count--cart")[0].innerHTML;
            return cartItems;
        }// If the number does not exist (before you have added anything), set it to 0.
        else {
            return 0;
        }
    }

    // Function to go to the next page in the store
    var nextPage = async function() {
        console.log("The function \"nextPage\" was initiated.");

        // Only run nextpage if the next page menu exists
        if (document.querySelectorAll(".paginator-control__container")[1]) {
            // Click the next page number at the bottom of the page, but only if it is not the last page.
            if (document.querySelectorAll(".paginator-control__container")[1].getElementsByTagName("a")[4].classList.contains("paginator-control__page-number--selected") == false) {
                document.querySelectorAll(".paginator-control__container")[1].getElementsByTagName("a")[4].click();
            }
            // If it's the last page, end the script and send user to the front page with a warning.
            else {
                console.log("We are on the last page, abort script and check out.");
                GM_setValue("returnurl", "https://store.playstation.com/");
                document.querySelector("div.right-nav-buttons > a:nth-child(2)").click();
                return await checkout();
            }

            // If we're on the checkout page, run the checkout function.
            if (whereAreWe() == "checkout") {
                console.log(`We're on the checkout page, so run the checkout script next. Verify this, URL should be: https://store.playstation.com/*/checkout/, this script thinks it is: ${location.href}`);
                return await checkout();
            }// If we're not on the checkout page, then just run the main function after cliking next page. Remember to reset i/nonFreeOffset so that it's ready for the new page.
            else {
                console.log("Going to the next page.")
                nonFreeOffset = 0;
                i = 0;
                return await psLoop();
            }
        } else {
            return alert('"Add free games to account script": There is no next page. Please browse to another page to start the script. You might have to refresh the next page to get the script started.');
        }
    }

    // Function to click the buy button.
    var clickBuy = async function() {
        // Declare the buyButton every time (don't?)
        var buyButton = document.querySelectorAll(".grid-cell__add-to-cart-button");

        // Check if the current buy button contains a number or not. If it does not, it contains the word "Free" or something similar.
        if (hasNumber(buyButton[nonFreeOffset].parentElement.getElementsByClassName("price-display__price")[0].innerText)) {
            nonFreeOffset++;

            // If nonFreeOffset is 30, we have gone through a full page with no free items.
            if (nonFreeOffset == 30) {
                paidPages++;
                console.log("paidPages incremented.");
                console.log("paidPages: " + paidPages);
            }

            return console.log(`Button ${i} is not free! "nonFreeOffset" is now: ${nonFreeOffset}.`);
        }// Else, click the first button (always 0 because the variable is updated every time the loop is ran.)

        else {
            buyButton[nonFreeOffset].click();
            // Wait 500 milliseconds to check for errors.
            await timeoutPal(500);

            // If you get a warning (usually that this item is not possible to purchase)
            if (document.getElementsByClassName("add-to-cart-error-dialog__text")[0].innerText) {
                console.log("Warning detected: You are not eligible to purchase or download this content.");
                document.querySelector("div.add-to-cart-error-dialog__button-group > button").click();
                return nonFreeOffset++;
            }

            // Reset paidPages as at least 1 free item has been found.
            paidPages = 0;
            return console.log(`Button i (${i}) or button nonFreeOffset (${nonFreeOffset}) was clicked.`);
        }

    }

    // "Pre-checkout" function, make sure that everything looks good.
    var goToCheckout = async function() {
        if (cartNumber() != 0) {
            // Get current location and store it, we will be redirected back to the same page to continue the script.
            if (location.href.match(/grid/) && paidPages < 2) {
                GM_setValue("returnurl", location.href);
            }
            else if (paidPages == 2) {
                GM_setValue("returnurl", "https://store.playstation.com");
            }
            else {
                console.log("Alert popped up. Please report this bug on Github.")
                return alert("The current location is not a URL that contains '/grid', script aborted.");
            }
            // Click cart button
            document.querySelector("div.right-nav-buttons > a:nth-child(2)").click();
            return await checkout();
        } else {
            return alert("There is apparantly 0 items in the cart, so the checkout button will not be pressed. Function aborted.");
        }
    }

    // The main buy function.
    var psLoop = async()=>{
        console.log("Welcome to this script where you can add free Playstation games and DLC's to your account. We will now wait 7 seconds before we are ready to start.");

        // Wait 7 seconds for the page to fully load. Move this into some if statement, as it's not necessary when you run the function the second time? Test.
        await timeoutPal(7000);

        // If we have waited through two full pages of paid apps, then cancel the script.
        if (paidPages == 2) {
            var errorMessage = "At least two full pages of games have been checked, and none of them have been free. The script will now go to checkout and then cancel. Please sort by 'Price (Low-High)' to avoid having this happen. This can also mean that you have added all apps in this category, in that case: congratulations";
            alert(errorMessage);
            console.log(errorMessage);
            return await goToCheckout();
        }
        // While the number of items is less then 10 and there's actually some "Add to cart"-buttons on the page, start the main script
        while (cartNumber() < 2 && typeof document.querySelectorAll(".grid-cell__add-to-cart-button")[nonFreeOffset] != "undefined") {
            i++;
            // The number of times the loop has been ran

            // If there's no "add to cart" buttons left, go to the next page.
            if (document.querySelectorAll(".grid-cell__add-to-cart-button").length == 0) {
                console.log(`There's no "Add to cart" buttons, going to the next page. The loop ran ${i} times`);
                return nextPage();
            } else {
                // Run the clickBuy function
                clickBuy();

                // Then wait 2 seconds because the site is kind of slow.
                await timeoutPal(2000);
                console.log(`There's (now) ${cartNumber()} items in the basket.`);
            }
        }

        // Another way of checking if there's no more "Add to cart" buttons.
        while (cartNumber() < 2 && typeof document.querySelectorAll(".grid-cell__add-to-cart-button")[nonFreeOffset] == "undefined") {
            console.log('There is no more "Add to cart" buttons on this page. Sending you to the next page, as there is not yet 10 items in your cart.');
            return nextPage();
        }

        // Wait 1 seconds after the loop is finished (why? test).
        await timeoutPal(1000);

        console.log(`The script is now complete, there are ${cartNumber()} items in the shopping cart, and we will now check out.`);

        // Go to checkout
        return await goToCheckout();
    }
    // psLoop end

    var checkout = async()=>{
        console.log("The checkout function has now begun.");
        paidPages = 0;

        await timeoutPal(2000);

        if (whereAreWe() == "checkout") {
            var proceedButton = document.getElementsByName("proceed-to-checkout")[0];

            // If the 'Proceed to Checkout' button is disabled, go back to returnurl
            if (proceedButton.classList.contains("disabled")) {
                console.log("It's not possible to click 'Proceed to Checkout' because the button is disabled! Aborting script.");
                return window.open(GM_getValue("returnurl"), "_self");

            }// Else if the Checkout button is not disabled, but the sub-total contains the numbers from 1 to 9, abort the script because something costs money.
            else if (document.getElementsByName("sub-total")[0].innerText.match(/[1-9]/)) {
                console.log("The sub total is not zero, aborting script.");
                return alert("The sub total is not zero, aborting script! Please remove anything that costs money");
            } else {
                console.log("Clicking 'Proceed to checkout'");
                proceedButton.click();
                await timeoutPal(1500);
                // We need to wait, or else the URL check in confrm() will not work.
                return await confrm();
            }

        } else {
            console.log("Are we not on the /checkout page? Script seems to not think so. Report bugs via Github please.");
            return await psLoop();
        }

    }
    // checkout end

    var confrm = async()=>{
        if (whereAreWe() == "confirm") {
            // For a second time, check that the sub-total is 0 (this is done because you can start the script from the confirm page if you try hard enough)
            if (document.getElementsByName("sub-total")[0].innerText.match(/[1-9]/)) {
                console.log("The sub total is not zero, aborting script.");
                return alert("The sub total is not zero, aborting script! Please remove anything that costs money");
            } else {
                // If the 'Order & Pay' button exists, click it
                if (document.getElementsByName("confirm-purchase")[0]) {
                    document.getElementsByName("confirm-purchase")[0].click();
                    console.log("Clicked 'Order & Pay'");

                    // Return to the last store page browsed and loop the script
                    if (GM_getValue("returnurl") == "https://store.playstation.com/") {
                        alert("You reached the last page and therefore you were checked out. Sending you back to the front page.");
                        return window.open(GM_getValue("returnurl"), "_self");
                    }

                    return window.open(GM_getValue("returnurl"), "_self");

                }// If for some reason, there is a "Proceed to checkout" button here, go back to the checkout function (this should never happen)
                else if (document.getElementsByName("proceed-to-checkout")[0]) {
                    console.log("Error message: This should not happen, please report this on Github if you are in a loop.");
                    // open location somewhere before sending to checkout()?
                    return await checkout();
                } else {
                    return alert("Found no suitable button to click. Report bugs via Github please.");
                }
            }
        } else {
            alert("Are we not on the /confirm page? Script seems to not think so. Report bugs via Github please.");
            // open location somewhere before sending to checkout()?
            return await checkout();
        }
    }
    // confrm end

    // Actual code execution starts here
    // Insert a box with information on the page. Move this into some function?
    document.querySelector("#vsf-root").insertAdjacentHTML("beforeend", '<div style="z-index: 9999; width: 350px; height: 210px; display: flow-root; background-color: white; position: absolute; top: 200px !important; left: 200px !important; left: 300px; box-shadow: inset 0 0 10px #000000; padding-top: 20px;"><p style="margin: 10px; text-align: center; font-size: 0.8em; color: black ">If you see this box, it means that the "Add free games to account" userscript is running. If you do not want to run this script, disable it in Tampermonkey / Greasemonkey and refresh the tab, otherwise it will run automatically every time you visit the browse page.<br><br>Please open Console if you want to see what the script is doing and to verify that it is working.</p></div>');

    // Start the script based on what URL we are on.
    if (whereAreWe() == "checkout") {
        return await checkout();
    } else if (whereAreWe() == "confirm") {
        return await confrm();
    } else {
        return await psLoop();
    }
}
)();
