# Contributing

Thanks for helping make Universal PiP for Safari better.

## Good first contributions

- Add site-specific polish for popular players.
- Improve PiP button placement for unusual layouts.
- Report sites where the toolbar action works but the inline button does not.
- Improve install documentation for newer macOS and Safari versions.

## Development

The project has two main parts:

- `extension/`: the Safari WebExtension source.
- `safari/`: the generated macOS Safari extension app project.

After editing the extension source, mirror changes into:

```sh
safari/Universal\ PiP/Universal\ PiP\ Extension/Resources/
```

Then run:

```sh
./scripts/install.sh
```

## Pull requests

Please keep pull requests focused. Include:

- What changed.
- Which site or player you tested.
- Whether the toolbar button, inline button, and `Option-P` shortcut work.
