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
Currently, the version is set at 1.190, because the tests in the pipeline failed for lower versions and it wasn't reproducible otherwise. Usually, I only increase the minimally supported code version, if there is feature in a newer version that I need.