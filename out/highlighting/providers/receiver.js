"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiverProvider = void 0;
const vscode_1 = require("vscode");
const web_tree_sitter_1 = require("web-tree-sitter");
const utils_1 = require("../utils");
class ReceiverProvider {
    constructor() {
        this.decorationType = vscode_1.window.createTextEditorDecorationType({
            color: '#4EADE5FF',
        });
    }
    provideDecorations(tree, lang) {
        const decorations = [];
        const query = new web_tree_sitter_1.Query(lang, `
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
                decorations.push({ range: (0, utils_1.toVsRange)(receiverNode) });
                const bodyCaptures = query.captures(bodyNode);
                for (const cap of bodyCaptures) {
                    if (cap.name === 'id' && cap.node.text === receiverName) {
                        decorations.push({ range: (0, utils_1.toVsRange)(cap.node) });
                    }
                }
            }
        });
        return decorations;
    }
}
exports.ReceiverProvider = ReceiverProvider;
//# sourceMappingURL=receiver.js.map