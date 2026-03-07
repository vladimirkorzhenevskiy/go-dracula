import { window, DecorationOptions, TextEditorDecorationType } from 'vscode';
import { Tree, Language, Query } from 'web-tree-sitter';
import { toVsRange } from '../utils';

export class ConstructorProvider {
    private readonly constructors = new Set([
        'make', 
        'new',
    ]);

    public readonly decorationType: TextEditorDecorationType = window.createTextEditorDecorationType({
        color: '#FFC660',
    });

    public provideDecorations(tree: Tree, lang: Language): DecorationOptions[] {
        const decorations: DecorationOptions[] = [];
        
        const query = new Query(lang, `(call_expression function: (identifier) @func.name)`);
        const matches = query.matches(tree.rootNode);

        for (const match of matches) {
            const node = match.captures[0].node;

            if (this.constructors.has(node.text)) {
                decorations.push({ range: toVsRange(node) });
            }
        }

        return decorations;
    }
}
