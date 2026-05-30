# Universal PiP for Safari

Safari WebExtension source that adds a Picture in Picture button directly over HTML5 video players.

## What it does

- Detects HTML5 `<video>` elements on normal pages and in accessible iframes.
- Adds a native-looking PiP button over each usable video.
- Keeps the button aligned while the page scrolls, resizes, changes fullscreen state, or swaps players dynamically.
- Keeps the screen awake while videos are playing when Safari supports Screen Wake Lock.
- Uses Safari's native `webkitSetPresentationMode("picture-in-picture")` path when available, then falls back to the standard Picture-in-Picture API.
- Adds a Safari toolbar action and `Option-P` shortcut that target the best visible video.

## Limits

No extension can be perfectly integrated into every video player. Sites can hide videos behind closed shadow DOM, inaccessible cross-origin frames, DRM layers, custom canvas renderers, or anti-PiP restrictions. This extension covers the normal and common hard cases without mutating player markup.

## Convert to a Safari extension app

From this folder:

```sh
xcrun safari-web-extension-converter . --project-location ../UniversalPiP-Safari --app-name "Universal PiP" --bundle-identifier "com.example.universalpip"
```

Open the generated Xcode project, choose your signing team, build the macOS app, run it once, then enable the extension in Safari Settings > Extensions.

## Test page

Open `test/demo.html` in Safari after enabling the extension.
