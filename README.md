# Paste URL to Link

A Joplin plugin for the Markdown editor: select some text, paste a URL over
it, and the selection becomes a Markdown link, the same behavior as
WordPress's block editor.

![Selecting text and pasting a URL turns it into a Markdown link](docs/demo.gif)

Example: select `Joplin` and paste `https://joplinapp.org` → it becomes
`[Joplin](https://joplinapp.org)`.

If the selection is already a Markdown link (`[label](old-url)`), pasting a
new URL updates the link target instead of nesting a new link around it.

Only `http:`, `https:`, `ftp:` and `mailto:` URLs are turned into links. Any
other paste (plain text, several words, no selection, multiple cursors, or a
selection spanning several paragraphs) behaves as usual.

## Requirements

- Joplin desktop 3.7 or later
- The Markdown editor (the plugin does nothing in the Rich Text editor)

## Installation

In Joplin, open **Tools → Options → Plugins**, search for **Paste URL to Link**
and click **Install**.

To install it manually, download the `.jpl` file from the
[plugin page](https://joplinapp.org/plugins/plugin/com.danielkossmann.pasteUrlToLink/),
then in **Options → Plugins** click the gear icon → **Install from file** and
select the downloaded file.

## Development

See [DEVELOPMENT.md](https://github.com/kossmann/joplin-paste-url-to-link/blob/main/DEVELOPMENT.md) for how the plugin works, and how to
build, test and publish it.

## License

[MIT](LICENSE)

---

Made by [Daniel Kossmann](https://www.danielkossmann.com).
