const vscode = require('vscode');
const { getCheckerConfig, getFileList, getSpellingMistakeInfo } =  require('./handlers/file-reader');
const { TreeViewProvider } = require('./handlers/tree-view-provider');
const { createWebView } = require('./handlers/web-view-provider');

function activate(context) {
	const getMistakeInfo = () => {
		const rootInfo = vscode.workspace.workspaceFolders[0];
		if(!rootInfo) return {};
		const rootPath = rootInfo.uri.fsPath;
		const checkerConfig = getCheckerConfig(rootPath);
		const fileList = getFileList(rootPath, checkerConfig);
		const { spellingMistakeInfo, mistakeWordInfo } = getSpellingMistakeInfo(fileList, checkerConfig, rootPath);
		return { spellingMistakeInfo, mistakeWordInfo };
	}	
	let refresh = vscode.commands.registerCommand('project-spell-checker.refresh', function () {
		vscode.window.showInformationMessage('start checking suspected spelling mistakes...');
		vscode.window.showInformationMessage('This may take a long time. Please be patient～');
		const timerOut = setTimeout(() => {
			clearTimeout(timerOut);
			const { spellingMistakeInfo } = getMistakeInfo();
			console.log(spellingMistakeInfo);
			if(spellingMistakeInfo) {
				TreeViewProvider.initTreeView(spellingMistakeInfo);
			} else {
				vscode.window.showInformationMessage('no suspected spelling mistakes!');
			}
		}, 100)
	});

	let showStatistics = vscode.commands.registerCommand('project-spell-checker.showview', function () {
		const rootInfo = vscode.workspace.workspaceFolders[0];
		if(!rootInfo) return {};
		const rootPath = rootInfo.uri.path;
		const { mistakeWordInfo } = getMistakeInfo();
		const webView = createWebView(context, vscode.ViewColumn.Active, mistakeWordInfo, rootPath);
		context.subscriptions.push(webView);
	}) 

	let clickItem = vscode.commands.registerCommand('itemClick', (info) => {
		vscode.window.showTextDocument(vscode.Uri.file(info.path))
	});

	context.subscriptions.push(...[refresh, showStatistics, clickItem]);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
