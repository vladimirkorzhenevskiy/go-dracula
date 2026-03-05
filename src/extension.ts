import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    // 1. Стили как в GoLand / Dracula
    const receiverStyle = vscode.window.createTextEditorDecorationType({ color: '#4EADE5FF' }); // Cyan
    const builtinYellowStyle = vscode.window.createTextEditorDecorationType({ color: '#FFC660' }); // Yellow (как func)
    const builtinOrangeStyle = vscode.window.createTextEditorDecorationType({ color: '#CC7832' }); // Orange
    const importStyle = vscode.window.createTextEditorDecorationType({
        color: '#6A8759',
        textDecoration: 'none; border-bottom: none;' // Убираем синие подчеркивания LSP
    });
    const structTagKeyStyle = vscode.window.createTextEditorDecorationType({ color: '#A9B7C6' }); // Orange (тэги json, xml)

    function update(editor: vscode.TextEditor | undefined) {
        if (!editor || editor.document.languageId !== 'go') return;

        const text = editor.document.getText();
        const receiverDecorations: vscode.DecorationOptions[] = [];
        const yellowDecorations: vscode.DecorationOptions[] = [];
        const orangeDecorations: vscode.DecorationOptions[] = [];
        const importDecorations: vscode.DecorationOptions[] = [];
        const tagKeyDecorations: vscode.DecorationOptions[] = [];

        // 1. ФИКС ИМПОРТОВ (строгий поиск кавычек внутри блока и снаружи)
        const importBlockRegex = /import\s*(?:\(\s*([\s\S]*?)\)|("[^"]+"))/g;
        let match;
        while ((match = importBlockRegex.exec(text)) !== null) {
            const fullMatch = match[0];
            const startIdx = match.index;
            
            // Ищем все кавычки внутри найденного блока импорта
            const quoteRegex = /"[^"]+"/g;
            let qMatch;
            while ((qMatch = quoteRegex.exec(fullMatch)) !== null) {
                const globalStart = startIdx + qMatch.index;
                importDecorations.push({ range: new vscode.Range(editor.document.positionAt(globalStart), editor.document.positionAt(globalStart + qMatch[0].length)) });
            }
        }

        const structTagRegex = /`([^`]+)`/g;
        while ((match = structTagRegex.exec(text)) !== null) {
            const tagContent = match[1];
            const tagStartIdx = match.index + 1; // +1 чтобы пропустить саму кавычку `

            // Внутри тэга ищем ключи перед двоеточием, например json:"..."
            const keyRegex = /([a-zA-Z0-9_-]+):(?=")/g;
            let keyMatch;
            while ((keyMatch = keyRegex.exec(tagContent)) !== null) {
                const globalIdx = tagStartIdx + keyMatch.index;
                const startPos = editor.document.positionAt(globalIdx);
                const endPos = editor.document.positionAt(globalIdx + keyMatch[1].length);
                tagKeyDecorations.push({ range: new vscode.Range(startPos, endPos) });
            }
        }

        // --- ЛОГИКА РЕСИВЕРА ---
        const funcRegex = /func\s*\(\s*([a-zA-Z0-9_]+)\s+[\*\s]*[a-zA-Z0-9_.]+\s*\)/g;

        while ((match = funcRegex.exec(text)) !== null) {
            const name = match[1];
            const startSearch = match.index;
            const bodyStart = text.indexOf('{', startSearch);
            if (bodyStart === -1) continue;
            const bodyEnd = findClosingBracket(text, bodyStart);

            const usageRegex = new RegExp(`\\b${name}\\b`, 'g');
            const funcText = text.substring(startSearch, bodyEnd);
            
            let usageMatch;
            while ((usageMatch = usageRegex.exec(funcText)) !== null) {
                const offset = startSearch + usageMatch.index;
                const pos = editor.document.positionAt(offset);
                if (isSafe(editor.document, pos)) {
                    receiverDecorations.push({ range: new vscode.Range(pos, editor.document.positionAt(offset + name.length)) });
                }
            }
        }

        // --- ЛОГИКА ВСТРОЕННЫХ ФУНКЦИЙ ---
        const allText = text;
        
        // Поиск make и new (Желтый)
        const yellowRegex = /\b(make|new)\b/g;
        while ((match = yellowRegex.exec(allText)) !== null) {
            const pos = editor.document.positionAt(match.index);
            if (isSafe(editor.document, pos)) {
                yellowDecorations.push({ range: new vscode.Range(pos, editor.document.positionAt(match.index + match[0].length)) });
            }
        }

        // Поиск len, max, min, append (Оранжевый)
        const orangeRegex = /\b(len|max|min|append|cap|copy|delete|panic|recover)\b/g;
        while ((match = orangeRegex.exec(allText)) !== null) {
            const pos = editor.document.positionAt(match.index);
            if (isSafe(editor.document, pos)) {
                orangeDecorations.push({ range: new vscode.Range(pos, editor.document.positionAt(match.index + match[0].length)) });
            }
        }

        editor.setDecorations(importStyle, importDecorations);
        editor.setDecorations(structTagKeyStyle, tagKeyDecorations);
        editor.setDecorations(receiverStyle, receiverDecorations);
        editor.setDecorations(builtinYellowStyle, yellowDecorations);
        editor.setDecorations(builtinOrangeStyle, orangeDecorations);
    }

    // Проверка: не в кавычках ли и не в комментарии
    function isSafe(doc: vscode.TextDocument, pos: vscode.Position): boolean {
        const line = doc.lineAt(pos.line).text;
        const before = line.substring(0, pos.character);
        const quotes = (before.match(/"/g) || []).length;
        if (quotes % 2 !== 0) return false; // Внутри кавычек
        if (before.trim().startsWith('//')) return false; // В комментарии
        return true;
    }

    function findClosingBracket(text: string, start: number) {
        let d = 0;
        for (let i = start; i < text.length; i++) {
            if (text[i] === '{') d++;
            if (text[i] === '}') { d--; if (d === 0) return i + 1; }
        }
        return text.length;
    }

        // 1. Сразу при открытии
    if (vscode.window.activeTextEditor) {
        update(vscode.window.activeTextEditor);
    }

    // 2. При смене табов — мгновенно
    vscode.window.onDidChangeActiveTextEditor(editor => {
        update(editor);
    }, null, context.subscriptions);

    let timeout: NodeJS.Timeout | undefined;
    vscode.workspace.onDidChangeTextDocument(event => {
        const editor = vscode.window.activeTextEditor;
        if (editor && event.document === editor.document) {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => update(editor), 16); 
        }
    }, null, context.subscriptions);
}
