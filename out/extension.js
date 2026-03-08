"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
const vscode = require("vscode");
const web_tree_sitter_1 = require("web-tree-sitter");
const treeManager_1 = require("./treeManager");
const highlighting_1 = require("./highlighting");
async function activate(context) {
    try {
        const { parser, Go } = await initTreeSitter(context);
        const treeManager = new treeManager_1.TreeManager(parser);
        const highlighter = new highlighting_1.Highlighter();
        let timeout;
        const triggerUpdate = (editor, event) => {
            if (editor.document.languageId !== 'go')
                return;
            if (timeout)
                clearTimeout(timeout);
            timeout = setTimeout(() => {
                let tree;
                if (event) {
                    tree = treeManager.updateTree(event);
                }
                else {
                    tree = treeManager.getTree(editor.document);
                }
                if (tree) {
                    highlighter.apply(editor, tree, Go);
                }
            }, 50);
        };
        context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => {
            const editor = vscode.window.activeTextEditor;
            if (editor && event.document === editor.document) {
                triggerUpdate(editor, event);
            }
        }), vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor)
                triggerUpdate(editor);
        }), vscode.workspace.onDidCloseTextDocument(doc => {
            treeManager.removeTree(doc.uri.toString());
        }), new vscode.Disposable(() => highlighter.dispose()));
        if (vscode.window.activeTextEditor) {
            triggerUpdate(vscode.window.activeTextEditor);
        }
        console.log('Semantic highlighting is now active!');
    }
    catch (error) {
        console.error('Failed to activate extension:', error);
        vscode.window.showErrorMessage('Ошибка инициализации Tree-sitter: ' + error);
    }
}
async function initTreeSitter(context) {
    await web_tree_sitter_1.Parser.init({
        locateFile: (name) => vscode.Uri.joinPath(context.extensionUri, 'node_modules', 'web-tree-sitter', name).fsPath
    });
    const path = vscode.Uri.joinPath(context.extensionUri, 'parsers', 'tree-sitter-go.wasm').fsPath;
    const Go = await web_tree_sitter_1.Language.load(path);
    const parser = new web_tree_sitter_1.Parser();
    parser.setLanguage(Go);
    return { parser, Go };
}
//# sourceMappingURL=extension.js.map