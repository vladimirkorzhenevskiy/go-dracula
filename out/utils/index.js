"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
function toVsRange(node) {
    return new vscode_1.Range(node.startPosition.row, node.startPosition.column, node.endPosition.row, node.endPosition.column);
}
//# sourceMappingURL=index.js.map