"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Highlighter = void 0;
const providers_1 = require("./providers");
class Highlighter {
    constructor() {
        this.providers = [
            new providers_1.ImportProvider(),
            new providers_1.TagProvider(),
            new providers_1.ReceiverProvider(),
            new providers_1.ConstructorProvider(),
        ];
    }
    apply(editor, tree, lang) {
        for (const provider of this.providers) {
            const decorations = provider.provideDecorations(tree, lang);
            editor.setDecorations(provider.decorationType, decorations);
        }
    }
    dispose() {
        for (const p of this.providers) {
            p.decorationType.dispose();
        }
    }
}
exports.Highlighter = Highlighter;
//# sourceMappingURL=highlighter.js.map