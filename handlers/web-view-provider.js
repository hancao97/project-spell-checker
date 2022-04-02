const { window, Uri } = require('vscode');
let webviewPanel;
function createWebView(context, viewColumn, data, rootPath) {
    if (webviewPanel === undefined) {
        webviewPanel = window.createWebviewPanel(
            'spelling-check-statistics',
            'spelling-check-statistics',
            viewColumn,
            {
                retainContextWhenHidden: true,
                enableScripts: true
            }
        )
    } else {
        webviewPanel.reveal();
    }
    webviewPanel.webview.html = getHtml(data);
    webviewPanel.webview.onDidReceiveMessage(message => {
        if(message.jump) {
            window.showTextDocument(Uri.file(rootPath + message.jump))
        }
    }, undefined, context.subscriptions);
    webviewPanel.onDidDispose(() => {
        webviewPanel = undefined;
    });
    return webviewPanel;
}

function getHtml(data) {
    const _data = {
        name: 'suspected mistakes',
        children: data
    }
    const _height = data.reduce((total, current) => {
        return total + current.children.length * 25;
    }, 0)
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    
    <body style="background: #fff;">
        <div id="test"></div>
        <div style="width:100%;height:100vh;overflow: auto;">
            <div id="main" style="min-width: 100%;height: ${_height}px;"></div>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/echarts@5.3.2/dist/echarts.min.js"></script>
        <script>
            const vscode = acquireVsCodeApi();
            var chartDom = document.getElementById('main');
            var myChart = echarts.init(chartDom);
            var option;
            const data = ${JSON.stringify(_data)};
            myChart.on('click', 'series', function (params) {
                if(params.data.type == 'path') {
                    vscode.postMessage({jump: params.data.name});
                }
            });
            option = {
                tooltip: {
                  trigger: 'item',
                  triggerOn: 'mousemove',
                  formatter: '{b}'
                },
                series: [
                  {
                    type: 'tree',
                    data: [data],
                    top: '1%',
                    left: '15%',
                    bottom: '1%',
                    right: '60%',
                    symbolSize: 7,
                    initialTreeDepth: 1,
                    label: {
                        backgroundColor: '#fff',
                        position: 'left',
                        verticalAlign: 'middle',
                        align: 'right',
                        fontSize: 16
                    },
                    leaves: {
                      label: {
                        position: 'right',
                        verticalAlign: 'middle',
                        align: 'left'
                      }
                    },
                    emphasis: {
                      focus: 'descendant'
                    },
                    expandAndCollapse: true,
                    animationDuration: 550,
                    animationDurationUpdate: 750
                  }
                ]
            };
            option && myChart.setOption(option);
        </script>
    </body>
    </html>
    `
}

module.exports = {
    createWebView
}