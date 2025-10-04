## Recording demo gifs
- Create a new profile and switch to it
- Use the `Light (Visual Studio)` theme
- Set editor font size to 15px
- Resize the window horizontally to about 800px
- Record the whole window with the sidebar hidden
- Resize gif with `gifsicle --resize 800x sortOrderExample.gif > sortOrderExample.gif`

# Debug extension tests
You can change `test` to `test.only` to execute only a single test

## Current minimally supported VSCode version
I only increase the minimally supported code version, if there is feature in a newer version that I need. The most current feature that is in use is `--profile-temp` which was introduced in [1.72](https://code.visualstudio.com/updates/v1_72#_extension-debugging-in-a-clean-environment)