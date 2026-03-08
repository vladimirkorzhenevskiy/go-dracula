import { window, DecorationOptions, Range } from 'vscode';
import { Tree, Language, Query } from 'web-tree-sitter';
import { toVsRange } from '../utils';

export class ImportProvider {
    public readonly decorationType = window.createTextEditorDecorationType({
        color         : '#6A8759',
        textDecoration: 'none; border-bottom: none;'
    });

    public provideDecorations(tree: Tree, lang: Language): DecorationOptions[] {
        const decorations: DecorationOptions[] = [];

        const query = new Query(lang, `
            (import_spec path: (interpreted_string_literal) @import.path)
        `);

        const matches = query.matches(tree.rootNode);

        for (const match of matches) {
            const node = match.captures.find(c => c.name === 'import.path')?.node;

            if (node) {
                decorations.push({ range: toVsRange(node) });
            }
        }

        return decorations;
    }
}
