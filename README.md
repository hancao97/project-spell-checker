# 使用指南「Chinese」

`project-spell-checker` 是具备自定义能力并完成全项目拼写检查的 vscode 插件。
具体能力分为三个：
- 通过配置文件自定义插件扫描的文件范围
- 通过 `tree-view` 显示各文件下的疑似拼写错误，并提示最多五个正确单词猜想
- 通过 `web-view` 显示各个疑似拼写错误出现在哪些文件

提示：`tree-view` 与 `web-view` 均支持文件的快捷跳转

## 配置文件

配置文件 `spell-checker-config.json` 可以放置于 `.vscode` 或者 `.project` 目录下，插件会自动读取，新建文件后输入：`project-spell-checker` 按下 tab ，可以自动生成配置文件模板内容：

```
{
   "excludedFloders": ["node_modules", ".git", ".DS_Store"],
   "includedFileSubfixes": [".vue", ".js"],
   "excludedFileNames": ["en-US.js", "zh-CN.js", "iconfont.js", "zh.js", "en.js"],
   "whiteList": "a,b"
}
```

- `excludedFloders`： 不进行扫描的目录名
- `includedFileSubfixes`：需要扫描的文件后缀名
- `excludedFileNames`：不进行扫描的文件名
- `whiteLis`t：单词白名单（支持字符串数组以及 , 分割的字符串）

## 视图

插件上面存在两个按钮：
- 按钮一：形如统计图的按钮用来扫描并打开 `web-view`
- 按钮一：形如刷新的按钮用来扫描并打开 `tree-view`

### tree-view

树视图的展示维度为：

**文件 -> 疑似拼写错误**

树形结构格式基本为：
```
|- fileName-[suspected spelling mistake count]
|-- mistake1 -✓-> spelling suggestions OR :(
|-- mistake2 -✓-> spelling suggestions OR :(
|-- mistake3 -✓-> spelling suggestions OR :(
|-- mistake4 -✓-> spelling suggestions OR :(
```
可以点击文件名以进行跳转
### web-view

页面视图的展示维度为：

**疑似拼写错误 -> 文件**

树形结构格式基本为：
```
    ----|- mistake1     - file-path1
                        - file-path2
                  
root----|- mistake2     - file-path3
                         
    ----|- mistake3     - file-path4
```

可以点击文件名以进行跳转

# Usage guide [English]

`project-spell-checker` is a vscode plugin with customizable capabilities and full project spell checking.
The specific capabilities are divided into three.
- Customise the range of files scanned by the plugin via the configuration file
- `tree-view` shows suspected spelling errors under each file and suggests up to five correct word guesses
- Show which files are suspected of having spelling errors via `web-view

Tip: `tree-view` and `web-view` both support shortcuts to files

## Configuration files

The configuration file `spell-checker-config.json` can be placed in the `.vscode` or `.project` directories and will be read automatically by the plugin.

```
{
   "excludedFloders": ["node_modules", ".git", ".DS_Store"],
   "includedFileSubfixes": [".vue", ".js"],
   "excludedFileNames": ["en-US.js", "zh-CN.js", "iconfont.js", "zh.js", "en.js"],
   "whiteList": "a,b"
}
```

- `excludedFloders`: the names of directories not to be scanned
- `includedFileSubfixes`: suffix names of files to be scanned
- `excludedFileNames`: names of files not to be scanned
- `whiteLis`t: word whitelist (supports arrays of strings as well as , split strings)

## View

Two buttons exist above the plug-in.
- Button one: a button shaped like a statistics chart to scan and open the `web-view`.
- Button one: a button shaped like a refresher to scan and open `tree-view`

### tree-view

The tree view is displayed in the following dimensions.

**document -> suspected spelling error**

The tree structure is basically formatted as.
```
|- fileName-[suspected spelling mistake count]
|-- mistake1 -✓-> spelling suggestions OR :(
|-- mistake2 -✓-> spelling suggestions OR :(
|-- mistake3 -✓-> spelling suggestions OR :(
|-- mistake4 -✓-> spelling suggestions OR :(
```
You can click on the file name to jump
### web-view

The display dimensions of the page view are.

**suspected spelling errors -> documents**

The tree structure is basically formatted as.
```
    ----|-mistake1      - file-path1
                        - file-path2
                  
root----|-mistake2      - file-path3
                         
    ----|-mistake3      - file-path4
```

You can click on the file name to jump