# Development

## How it works

The plugin registers a CodeMirror 6 content script
([`src/pasteUrlToLinkEditor.ts`](src/pasteUrlToLinkEditor.ts)) that adds a
transaction filter. Joplin pastes through several paths (CodeMirror's DOM
`paste` handling, Joplin's own Paste command and the editor context menu), but
all of them dispatch a transaction tagged `input.paste`. When such a
transaction replaces a single non-empty selection with a single URL (`http:`,
`https:`, `ftp:`, or `mailto:`, no whitespace), the filter rewrites it into
`[selected text](url)`. Any other paste (plain text, multiple words, no
selection, etc.) is left untouched.

## Build

```bash
npm install
npm run dist
```

This produces `publish/com.danielkossmann.pasteUrlToLink.jpl`.

## Testing changes

For quicker iteration, open **Options → Plugins → Show Advanced Settings** and
add the absolute path of this repository's `dist/` folder to **Development
plugins**. After each `npm run dist`, restart Joplin to load the new build.

## Publishing a release

1. Bump the version with `npm run updateVersion` (keeps `package.json` and
   `src/manifest.json` in sync), then commit and push.
2. Run `npm publish`. The `prepare` script rebuilds `publish/` first.
3. The [Joplin plugin repository](https://github.com/joplin/plugins) picks up
   npm packages named `joplin-plugin-*` with the `joplin-plugin` keyword. Its
   updater runs every few hours, so a new version can take several hours to
   appear in Joplin. The plugin page on joplinapp.org is rebuilt separately
   and may lag a little further behind.

The plugin page's README, icons and screenshots are read from this GitHub
repository, so changes to them only need a push, not a new npm release.
