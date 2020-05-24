Please note: I learned some JavaScript back in high school around 2010, so my code is using oudated functions and methods and is generally not very effective nor beautiful. However, all my scripts should work with very few issues. If you want to improve them, please do.

# Gamehag giveaway checker
Gamehag giveaway checker (spaghetti code). To install the userscript, go into the .js file, and click the "Raw" button on the top of the script. Try running it from /giveaway/309 to begin (it automatically starts).

If you don't want to skip giveaways you have already completed, change the line "var skipCompleted = 1;" into "var skipCompleted = 0;". It will then stop at every possibly functional giveaway even if you have already completed it. It can be hard for you to verify if it is 100% functional, but if the key is still visible then there is a high chance that others will be able to complete it as well.

# Steamgifts visited
It's very hard to keep track of what links in the Deals or the itch.io free games thread you have already opened. This script makes every link you have already opened a very bright red color, so that you can be sure that the itch.io claimable game you see linked is something you don't already own. It's not pretty, but it works.  

# Add free games to account
Do you want to add every single game, demo, DLC etc. to your account? This script will help you do exactly that. Starting with the Playstation Store, this script will browse through all the store pages and every single working free demo, avatar, theme, DLC, game and more to your account. This is version 0.1 and it has some issues, including, but not limited to:

- Not tested in all geographical locations
- No user interface
- Not yet possible to automatically add free demos and items where the buy button is missing from the browse page (working on it)

Before you run it you should know that I do not take any responsibility for whatever happens when you run this script. I do not know if this is against Sony's EULA. As a precaution you should also remove all payment methods from your account – the script will not continue if it sees that there is something non-free in your basket, but you can never be too sure as this is a fully automatic bot.

Todo list:
- Add button to start script instead of automatic start
- Add cancel button or shortcut
- Add free demos without buy button
- Make option to stop script on items that are "Free" but with no buy button. Recommend that you run the script with option off the first time, and on the second time.
- Upgrade js from 2008 style js to 2020 (let, not var, etc)

## How to run it
1. Go to [https://store.playstation.com/](https://store.playstation.com/).
2. Select something to browse for in the left menu ("All Games" for example)
3. The script will start automatically after about 7–8 seconds.

You should sort the store by "Price (Low-High)" for the script to be more effective. If you not have time to change this order before the script starts, disable the script, set the correct order, then activate the script in TamperMonkey and reload the page.
