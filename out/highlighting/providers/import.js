"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportProvider = void 0;
const vscode_1 = require("vscode");
const web_tree_sitter_1 = require("web-tree-sitter");
const utils_1 = require("../utils");
class ImportProvider {
    constructor() {
        this.decorationType = vscode_1.window.createTextEditorDecorationType({
            color: '#6A8759',
            textDecoration: 'none; border-bottom: none;'
        });
    }
    provideDecorations(tree, lang) {
        const decorations = [];
        const query = new web_tree_sitter_1.Query(lang, `
            (import_spec path: (interpreted_string_literal) @import.path)
        `);
        const matches = query.matches(tree.rootNode);
        for (const match of matches) {
            const node = match.captures.find(c => c.name === 'import.path')?.node;
            if (node) {
                decorations.push({ range: (0, utils_1.toVsRange)(node) });
            }
        }
        return decorations;
    }
}
exports.ImportProvider = ImportProvider;
//# sourceMappingURL=import.js.map