import { window, DecorationOptions, Range } from 'vscode';
import { Tree, Language, Query } from 'web-tree-sitter';
import { toVsRange } from '../utils';

export class ReceiverProvider {
    public readonly decorationType = window.createTextEditorDecorationType({
        color: '#4EADE5FF',
    });

    public provideDecorations(tree: Tree, lang: Language): DecorationOptions[] {
        const decorations: DecorationOptions[] = [];

        const query = new Query(lang, `
            (method_declaration
                receiver: (parameter_list (parameter_declaration name: (identifier) @receiver.name))
                body: (block) @body)
            ((identifier) @id)
        `);

        const matches = query.matches(tree.rootNode);

        matches.forEach(match => {
            const receiverNode = match.captures.find(c => c.name === 'receiver.name')?.node;
            const bodyNode = match.captures.find(c => c.name === 'body')?.node;

            if (receiverNode && bodyNode) {
                const receiverName = receiverNode.text;

                decorations.push({ range: toVsRange(receiverNode) });

                const bodyCaptures = query.captures(bodyNode);
                
                for (const cap of bodyCaptures) {
                    if (cap.name === 'id' && cap.node.text === receiverName) {
                        decorations.push({ range: toVsRange(cap.node) });
                    }
                }
            }
        });

        return decorations;
    }
}
