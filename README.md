# Universal PiP for Safari

Add a real Picture in Picture button to HTML5 video players in Safari.

[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-support%20the%20project-ffdd00?style=for-the-badge&logo=buymeacoffee&logoColor=111)](https://www.buymeacoffee.com/mojitoh)

Universal PiP is a small open-source Safari WebExtension for macOS. It watches for HTML5 videos, adds a floating PiP button directly on top of the player, and also provides a Safari toolbar button plus an `Option-P` shortcut when the player UI is difficult to reach.

If Universal PiP makes Safari better for you, please consider supporting the project with a coffee. It helps keep the extension free, maintained, and polished.

## Features

- Inline Picture in Picture button on HTML5 videos.
- Toolbar button for the best visible video on the page.
- `Option-P` shortcut.
- Works on dynamic players that replace video elements.
- Supports accessible iframes.
- Includes a separate settings page for placement and behavior.
- Supports Safari web apps on macOS 15+ when enabled in the web app's own extension settings.

## Install From Source

Requirements:

- macOS with Safari
- Xcode command line tools
- An Apple Development signing identity is recommended

Clone the repo, then run:

```sh
./scripts/install.sh
```

Then enable the extension:

```text
Safari > Settings > Extensions > Universal PiP for Safari
```

For Safari web apps, such as YouTube added to the Dock, enable it separately:

```text
YouTube > Settings > Extensions > Universal PiP for Safari
```

## Usage

- Hover a video and click the PiP button.
- Or use the Safari toolbar button.
- Or press `Option-P`.

## Project Structure

```text
extension/   WebExtension source
safari/      macOS Safari extension app project
scripts/     local build and install helpers
```

## Limitations

No extension can perfectly integrate with every player. Some sites hide video behind closed shadow DOM, inaccessible cross-origin frames, DRM layers, canvas renderers, or anti-PiP restrictions.

Universal PiP tries to cover the common cases without modifying the player's own markup more than necessary.

## Privacy

Universal PiP does not collect analytics, does not phone home, and does not store browsing history.

The extension requests broad page access because Safari requires that permission for detecting videos across websites.

## Support the Project

Universal PiP for Safari is free and open source.

If it saves you time, improves your Safari setup, or simply makes watching videos nicer, you are warmly encouraged to support the project with a coffee:

[Buy me a coffee](https://www.buymeacoffee.com/mojitoh)

Every coffee helps keep the extension maintained, polished, and free for everyone.

## License

MIT. See [LICENSE](LICENSE).
