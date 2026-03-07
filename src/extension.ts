import * as vscode from 'vscode';
import { Parser, Language } from 'web-tree-sitter';

import { TreeManager } from './treeManager';
import { Highlighter } from './highlighting';

export async function activate(context: vscode.ExtensionContext) {
    try {
        const { parser, Go } = await initTreeSitter(context); 

        const treeManager = new TreeManager(parser);
        const highlighter = new Highlighter();

        let timeout: NodeJS.Timeout | undefined;
        const triggerUpdate = (editor: vscode.TextEditor, event?: vscode.TextDocumentChangeEvent) => {
            if (editor.document.languageId !== 'go') return;

            if (timeout) clearTimeout(timeout);
            
            timeout = setTimeout(() => {
                let tree;
                
                if (event) {
                    tree = treeManager.updateTree(event);
                } else {
                    tree = treeManager.getTree(editor.document);
                }

                if (tree) {
                    highlighter.apply(editor, tree, Go);
                }
            }, 50);
        };

        context.subscriptions.push(
            vscode.workspace.onDidChangeTextDocument(event => {
                const editor = vscode.window.activeTextEditor;
                if (editor && event.document === editor.document) {
                    triggerUpdate(editor, event); 
                }
            }),
            

            vscode.window.onDidChangeActiveTextEditor(editor => {
                if (editor) triggerUpdate(editor);
            }),

            vscode.workspace.onDidCloseTextDocument(doc => {
                treeManager.removeTree(doc.uri.toString());
            }),

            new vscode.Disposable(() => highlighter.dispose())
        );

        if (vscode.window.activeTextEditor) {
            triggerUpdate(vscode.window.activeTextEditor);
        }

        console.log('Semantic highlighting is now active!');

    } catch (error) {
        console.error('Failed to activate extension:', error);
        vscode.window.showErrorMessage('Ошибка инициализации Tree-sitter: ' + error);
    }
}

async function initTreeSitter(context: vscode.ExtensionContext) {
    await Parser.init({
        locateFile: (name) => vscode.Uri.joinPath(
            context.extensionUri, 
            'node_modules', 
            'web-tree-sitter', 
            name
        ).fsPath
    });
    
    const path = vscode.Uri.joinPath(
        context.extensionUri, 
        'parsers', 
        'tree-sitter-go.wasm',
    ).fsPath;
    
    const Go = await Language.load(path);
    const parser = new Parser();
    parser.setLanguage(Go);
    
    return { parser, Go };
}
