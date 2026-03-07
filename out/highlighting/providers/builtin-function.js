"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuiltinFunctionProvider = void 0;
const vscode_1 = require("vscode");
const web_tree_sitter_1 = require("web-tree-sitter");
const utils_1 = require("../utils");
class BuiltinFunctionProvider {
    constructor() {
        this.decorationType = vscode_1.window.createTextEditorDecorationType({
            color: '#CC7832',
        });
        // without make and new
        this.builtins = new Set([
            'append', 'cap', 'close', 'complex', 'copy', 'delete',
            'imag', 'len', 'panic', 'print',
            'println', 'real', 'recover'
        ]);
    }
    provideDecorations(tree, lang) {
        const decorations = [];
        const query = new web_tree_sitter_1.Query(lang, `(call_expression function: (identifier) @func.name)`);
        const matches = query.matches(tree.rootNode);
        for (const match of matches) {
            const node = match.captures[0].node;
            if (this.builtins.has(node.text)) {
                decorations.push({ range: (0, utils_1.toVsRange)(node) });
            }
        }
        return decorations;
    }
}
exports.BuiltinFunctionProvider = BuiltinFunctionProvider;
//# sourceMappingURL=builtin-function.js.map