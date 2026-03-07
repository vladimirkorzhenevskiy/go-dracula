import { Range } from 'vscode'
import { Node } from 'web-tree-sitter';

export function toVsRange(node: Node): Range {
    return new Range(
        node.startPosition.row, 
        node.startPosition.column,
        node.endPosition.row, 
        node.endPosition.column
    );
}