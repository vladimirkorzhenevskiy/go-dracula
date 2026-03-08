"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Highlighter = exports.ReceiverProvider = void 0;
const vscode_1 = require("vscode");
class ReceiverProvider {
    constructor() {
        this.decorationType = vscode_1.window.createTextEditorDecorationType({
            color: '#4EADE5FF',
        });
    }
    provideDecorations(tree, lang) {
        return [];
    }
}
exports.ReceiverProvider = ReceiverProvider;
class Highlighter {
    constructor(lang) {
        this.providers = [
            new ReceiverProvider(),
        ];
    }
    apply(editor, tree, lang) {
        for (const provider of this.providers) {
            const decorations = provider.provideDecorations(tree, lang);
            editor.setDecorations(provider.decorationType, decorations);
        }
    }
}
exports.Highlighter = Highlighter;
//# sourceMappingURL=highlighter.js.map