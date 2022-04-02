const { TreeItem, window, TreeItemCollapsibleState, Uri } = require('vscode');
const path = require('path');

class TreeItemNode extends TreeItem {
    constructor(label, collapsibleState, info) {
        super(label, collapsibleState);
        this.info = info;
        if(!info) {
            this.iconPath = TreeItemNode.getIconUri('error');
        } else {
            this.iconPath = TreeItemNode.getIconUri('jump');
            this.command = {
                title: String(this.label),
                command: 'itemClick', 
                tooltip: String(this.label),  
                arguments: [  
                    this.info,   
                ]
            }
        }
    }
    static getIconUri(name) {
        return Uri.file(path.join(__filename,'..', '..' ,`resources/${name}.svg`));
    }
}
class TreeViewProvider {
    constructor(tree) {
        this.tree = tree;
    }

    getTreeItem(element) {
        return element;
    }

    getChildren(element) {
        if(!element) {
            return this.tree.map(item => new TreeItemNode(`${item.name}-[${item.info.count} suspected]`, TreeItemCollapsibleState['Expanded'], item.info));
        } else if(element.info) {
            return element.info.word.map(item => new TreeItemNode(`${item.original} -✓-> ${item.suggestion || ':('}`, TreeItemCollapsibleState['None']))
        }
    }

    static initTreeView(tree) {
        const treeViewProvider = new TreeViewProvider(tree);
        window.createTreeView('spellCheckerTree-main', {
            treeDataProvider: treeViewProvider
        });
    }
}

module.exports = {
    TreeViewProvider
}