import { window, DecorationOptions, Range } from 'vscode';
import { Tree, Language, Query } from 'web-tree-sitter';

export class TagProvider {
    public readonly decorationType = window.createTextEditorDecorationType({
        color: '#A9B7C6',
    });

    public provideDecorations(tree: Tree, lang: Language): DecorationOptions[] {
        const decorations: DecorationOptions[] = [];

        const query = new Query(lang, `(field_declaration tag: (raw_string_literal) @tag)`);
        const matches = query.matches(tree.rootNode);
        
        for (const match of matches) {
            const node = match.captures[0].node;
            const text = node.text;

            const regex = /\w+(?=:)/g;
            let found;

            while ((found = regex.exec(text)) !== null) {
                const nameRange = new Range(
                    node.startPosition.row, 
                    node.startPosition.column + found.index,
                    node.startPosition.row, 
                    node.startPosition.column + found.index + found[0].length
                );

                decorations.push({ range: nameRange });
            }
        }

        return decorations;
    }
}
