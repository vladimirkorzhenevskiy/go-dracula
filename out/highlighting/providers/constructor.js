"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstructorProvider = void 0;
const vscode_1 = require("vscode");
const web_tree_sitter_1 = require("web-tree-sitter");
const utils_1 = require("../utils");
class ConstructorProvider {
    constructor() {
        this.constructors = new Set([
            'make',
            'new',
        ]);
        this.decorationType = vscode_1.window.createTextEditorDecorationType({
            color: '#FFC660',
        });
    }
    provideDecorations(tree, lang) {
        const decorations = [];
        const query = new web_tree_sitter_1.Query(lang, `(call_expression function: (identifier) @func.name)`);
        const matches = query.matches(tree.rootNode);
        for (const match of matches) {
            const node = match.captures[0].node;
            if (this.constructors.has(node.text)) {
                decorations.push({ range: (0, utils_1.toVsRange)(node) });
            }
        }
        return decorations;
    }
}
exports.ConstructorProvider = ConstructorProvider;
//# sourceMappingURL=constructor.js.map