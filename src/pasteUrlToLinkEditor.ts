import { EditorState, Extension, Transaction, TransactionSpec } from '@codemirror/state';

interface CodeMirrorWrapper {
	addExtension: (extension: Extension) => void;
}

// Matches a single "word" that is a URL - no internal whitespace, and using a
// scheme that makes sense as a link target. Pasting anything else (plain
// text, multiple words, etc.) falls back to the default paste behaviour.
function pasteAsUrl(pastedText: string): string | null {
	const trimmed = pastedText.trim();
	if (!trimmed || /\s/.test(trimmed)) return null;

	try {
		const url = new URL(trimmed);
		if (!['http:', 'https:', 'ftp:', 'mailto:'].includes(url.protocol)) return null;
		return trimmed;
	} catch {
		return null;
	}
}

// Markdown link text can't contain unescaped square brackets without
// breaking the `[text](url)` syntax.
function escapeLinkText(text: string): string {
	return text.replace(/([[\]])/g, '\\$1');
}

// CommonMark only allows balanced parentheses in a bare link destination, so a
// URL like `https://example.com/a)b` needs the `<...>` form to stay intact.
function formatLinkDestination(url: string): string {
	let depth = 0;
	for (const char of url) {
		if (char === '(') depth++;
		if (char === ')' && --depth < 0) break;
	}
	return depth === 0 ? url : `<${url}>`;
}

// If the selection is itself an existing markdown link, e.g. `[label](old-url)`,
// re-use its label instead of wrapping the whole thing again into a nested link.
function labelForSelection(selectedText: string): string {
	const existingLink = selectedText.match(/^\[([^[\]]*)\]\([^()]*\)$/);
	if (existingLink) return existingLink[1];
	return escapeLinkText(selectedText);
}

// Joplin has several paste paths: CodeMirror's own DOM `paste` handling,
// and Joplin's "Paste" command/context menu, which reads the clipboard itself
// and calls `insertText` (no DOM paste event is fired). All of them end up
// dispatching a transaction tagged with the `input.paste` user event, so we
// intercept at the transaction level instead of listening for DOM events.
function pasteUrlToLink(tr: Transaction): Transaction | TransactionSpec {
	if (!tr.docChanged || !tr.isUserEvent('input.paste')) return tr;

	const selection = tr.startState.selection;
	if (selection.ranges.length !== 1 || selection.main.empty) return tr;
	const { from, to } = selection.main;

	let replacesSelection = true;
	let changeCount = 0;
	let insertedText = '';
	tr.changes.iterChanges((fromA, toA, _fromB, _toB, inserted) => {
		changeCount++;
		if (fromA !== from || toA !== to) replacesSelection = false;
		insertedText = inserted.toString();
	});
	if (changeCount !== 1 || !replacesSelection) return tr;

	const url = pasteAsUrl(insertedText);
	if (!url) return tr;

	// A link can't span a paragraph break, so leave multi-paragraph selections alone.
	const selectedText = tr.startState.sliceDoc(from, to);
	if (/\n\s*\n/.test(selectedText)) return tr;

	const linkMarkdown = `[${labelForSelection(selectedText)}](${formatLinkDestination(url)})`;

	return {
		changes: { from, to, insert: linkMarkdown },
		selection: { anchor: from + linkMarkdown.length },
		userEvent: 'input.paste',
		scrollIntoView: true,
	};
}

export default function(_context: unknown) {
	return {
		plugin: (codeMirrorWrapper: CodeMirrorWrapper) => {
			codeMirrorWrapper.addExtension(EditorState.transactionFilter.of(pasteUrlToLink));
		},
	};
}
