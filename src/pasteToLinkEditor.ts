import { EditorView } from '@codemirror/view';

interface CodeMirrorWrapper {
	addExtension: (extension: unknown) => void;
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
	} catch (error) {
		return null;
	}
}

// Markdown link text can't contain unescaped square brackets without
// breaking the `[text](url)` syntax.
function escapeLinkText(text: string): string {
	return text.replace(/([[\]])/g, '\\$1');
}

// If the selection is itself an existing markdown link, e.g. `[label](old-url)`,
// re-use its label instead of wrapping the whole thing again into a nested link.
function labelForSelection(selectedText: string): string {
	const existingLink = selectedText.match(/^\[([^[\]]*)\]\([^()]*\)$/);
	if (existingLink) return existingLink[1];
	return escapeLinkText(selectedText);
}

export default function(_context: unknown) {
	return {
		plugin: (codeMirrorWrapper: CodeMirrorWrapper) => {
			codeMirrorWrapper.addExtension(
				EditorView.domEventHandlers({
					paste: (event: ClipboardEvent, view: EditorView) => {
						const selection = view.state.selection.main;
						if (selection.empty) return false;

						const url = pasteAsUrl(event.clipboardData ? event.clipboardData.getData('text/plain') : '');
						if (!url) return false;

						const selectedText = view.state.sliceDoc(selection.from, selection.to);
						const linkMarkdown = `[${labelForSelection(selectedText)}](${url})`;

						view.dispatch({
							changes: { from: selection.from, to: selection.to, insert: linkMarkdown },
							selection: { anchor: selection.from + linkMarkdown.length },
							userEvent: 'input.paste',
						});

						event.preventDefault();
						return true;
					},
				}),
			);
		},
	};
}
