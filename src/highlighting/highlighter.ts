import { TextEditor, DecorationOptions, TextEditorDecorationType } from "vscode";
import { Tree, Language } from 'web-tree-sitter';

import { ReceiverProvider, TagProvider, ImportProvider, ConstructorProvider } from './providers';

export interface Provider {
    readonly decorationType: TextEditorDecorationType;
    provideDecorations(tree: Tree, lang: Language): DecorationOptions[];
}

export class Highlighter {
    private providers: Provider[];

    constructor() {
        this.providers = [
            new ImportProvider(),
            new TagProvider(),
            new ReceiverProvider(),
            new ConstructorProvider(),
        ];
    }

    public apply(editor: TextEditor, tree: Tree, lang: Language) {
        for (const provider of this.providers) {
            const decorations = provider.provideDecorations(tree, lang);
            editor.setDecorations(provider.decorationType, decorations);
        }
    }

    public dispose() {
        for (const p of this.providers) {
            p.decorationType.dispose();
        }
    }
}
