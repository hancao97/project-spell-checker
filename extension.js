const vscode = require('vscode');
const { getCheckerConfig, getFileList, getSpellingMistakeInfo } =  require('./handlers/file-reader');
const { TreeViewProvider } = require('./handlers/tree-view-provider');
const { createWebView } = require('./handlers/web-view-provider');

function activate(context) {
	const getRootPath = () => {
		const rootInfo = vscode.workspace.workspaceFolders[0];
		if(!rootInfo) {
			vscode.window.showInformationMessage('no suspected spelling mistakes!');
			return;
		} else {
			vscode.window.showInformationMessage('start checking suspected spelling mistakes...');
			vscode.window.showInformationMessage('This may take a long time. Please be patient～');
		}
		return rootInfo.uri.fsPath;
	}
	const delayFn = (fn = () => {}, delay = 100) => {
		const timerOut = setTimeout(() => {
			clearTimeout(timerOut);
			fn();
		}, delay)
	}
	const getMistakeInfo = (rootPath) => {
		const checkerConfig = getCheckerConfig(rootPath);
		const fileList = getFileList(rootPath, checkerConfig);
		const { spellingMistakeInfo, mistakeWordInfo } = getSpellingMistakeInfo(fileList, checkerConfig, rootPath);
		return { spellingMistakeInfo, mistakeWordInfo };
	}	
	let refresh = vscode.commands.registerCommand('project-spell-checker.refresh', function () {
		const rootPath = getRootPath();
		if(!rootPath) {
			return;
		}
		delayFn(() => {
			const { spellingMistakeInfo } = getMistakeInfo(rootPath);
			if(spellingMistakeInfo.length > 0) {
				TreeViewProvider.initTreeView(spellingMistakeInfo);
			} else {
				vscode.window.showInformationMessage('no suspected spelling mistakes!');
			}
		}, 100)
	});

	let showStatistics = vscode.commands.registerCommand('project-spell-checker.showview', function () {
		const rootPath = getRootPath();
		if(!rootPath) {
			return;
		}
		delayFn(() => {
			const { mistakeWordInfo } = getMistakeInfo(rootPath);
			const webView = createWebView(context, vscode.ViewColumn.Active, mistakeWordInfo, rootPath);
			context.subscriptions.push(webView);
		}, 100)
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
