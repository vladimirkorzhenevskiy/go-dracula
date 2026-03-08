"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeManager = void 0;
const web_tree_sitter_1 = require("web-tree-sitter");
class TreeManager {
    constructor(parser) {
        this.trees = new Map();
        this.parser = parser;
    }
    getTree(doc) {
        const uri = doc.uri.toString();
        const existingTree = this.trees.get(uri);
        if (existingTree) {
            return existingTree;
        }
        try {
            const tree = this.parser.parse(doc.getText());
            if (!tree) {
                return undefined;
            }
            this.trees.set(uri, tree);
            return tree;
        }
        catch (error) {
            console.error(`Failed to parse ${uri}: `, error);
            return undefined;
        }
    }
    updateTree(event) {
        const uri = event.document.uri.toString();
        let tree = this.trees.get(uri);
        if (tree && event.contentChanges.length > 0) {
            try {
                for (const change of event.contentChanges) {
                    const newPos = event.document.positionAt(change.rangeOffset + change.text.length);
                    tree.edit(new web_tree_sitter_1.Edit({
                        startIndex: change.rangeOffset,
                        oldEndIndex: change.rangeOffset + change.rangeLength,
                        newEndIndex: change.rangeOffset + change.text.length,
                        startPosition: { row: change.range.start.line, column: change.range.start.character },
                        oldEndPosition: { row: change.range.end.line, column: change.range.end.character },
                        newEndPosition: { row: newPos.line, column: newPos.character },
                    }));
                }
            }
            catch (e) {
                console.error("Failed to edit tree:", e);
                tree = undefined;
            }
        }
        try {
            const newTree = this.parser.parse(event.document.getText(), tree);
            if (!newTree) {
                return undefined;
            }
            this.trees.set(uri, newTree);
            if (tree && tree !== newTree) {
                tree.delete();
            }
            return newTree;
        }
        catch (e) {
            console.error("Failed to parse increment:", e);
            return undefined;
        }
    }
    removeTree(uri) {
        const tree = this.trees.get(uri);
        if (tree) {
            tree.delete();
        }
        this.trees.delete(uri);
    }
}
exports.TreeManager = TreeManager;
//# sourceMappingURL=treeManager.js.map