# Paste to Link

A Joplin plugin for the markdown editor: select some text, paste a URL over
it, and the selection becomes a markdown link — the same behavior as
WordPress's block editor.

Example: select `Joplin` and paste `https://joplinapp.org` → it becomes
`[Joplin](https://joplinapp.org)`.

If the selection is already a markdown link (`[label](old-url)`), pasting a
new URL updates the link target instead of nesting a new link around it.

## How it works

The plugin registers a CodeMirror 6 content script
([`src/pasteToLinkEditor.ts`](src/pasteToLinkEditor.ts)) that listens for the
editor's `paste` event. If there is a non-empty selection and the clipboard
contains a single URL (`http:`, `https:`, `ftp:`, or `mailto:`, no
whitespace), it replaces the selection with `[selected text](url)` instead of
performing the default paste. Any other paste (plain text, multiple words, no
selection, etc.) falls through to Joplin's normal paste behavior.

## Build

```bash
npm install
npm run dist
```

This produces `publish/com.danielkossmann.pasteToLink.jpl`.

## Install in Joplin

1. Open Joplin → **Options / Preferences → Plugins**.
2. Click the gear icon → **Install from file**.
3. Select `publish/com.danielkossmann.pasteToLink.jpl`.
4. Restart Joplin.

## Development

```bash
npm run dist          # rebuild dist/ and the .jpl archive
```

After rebuilding, reinstall the `.jpl` in Joplin (or copy `dist/` into your
profile's plugin development folder) and restart the app to pick up changes.
