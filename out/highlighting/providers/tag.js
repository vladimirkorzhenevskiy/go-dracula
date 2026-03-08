"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagProvider = void 0;
const vscode_1 = require("vscode");
const web_tree_sitter_1 = require("web-tree-sitter");
class TagProvider {
    constructor() {
        this.decorationType = vscode_1.window.createTextEditorDecorationType({
            color: '#A9B7C6',
        });
    }
    provideDecorations(tree, lang) {
        const decorations = [];
        const query = new web_tree_sitter_1.Query(lang, `(field_declaration tag: (raw_string_literal) @tag)`);
        const matches = query.matches(tree.rootNode);
        for (const match of matches) {
            const node = match.captures[0].node;
            const text = node.text;
            const regex = /\w+(?=:)/g;
            let found;
            while ((found = regex.exec(text)) !== null) {
                const nameRange = new vscode_1.Range(node.startPosition.row, node.startPosition.column + found.index, node.startPosition.row, node.startPosition.column + found.index + found[0].length);
                decorations.push({ range: nameRange });
            }
        }
        return decorations;
    }
}
exports.TagProvider = TagProvider;
//# sourceMappingURL=tag.js.map