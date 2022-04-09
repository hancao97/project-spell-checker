const fs = require('fs');
const path = require('path');
const SpellChecker = require('simple-spellchecker');
const dictionaryGB = SpellChecker.getDictionarySync("en-GB", path.join(__dirname, '../dict'));  
const dictionaryUS = SpellChecker.getDictionarySync("en-US", path.join(__dirname, '../dict'));  
const basicWhiteWords = 'redis,div,dialog,num,exe,whitelist,api,checkbox,iconfont,echarts,res,req,axios,username,timestamp,charset,offline,desc,plugin,webpack,lodash,xhr,debounce,textarea,ui,stringify,jpg,jpeg,vh,vw,gif,http,https,nav,toolbar,env,ele,timeline,config,configs,unshift,clearable,calc,enum,onload,csrf,onerror,onabort,vue,vuex,dist,js,json,todo,src,vm,const,img,src,svg,tooltip,params,async,await,rgb,rgba,cn,zh,attr,attrs,init,org,css,scss,sass,util,utils,arg,png,app,href,eslint,fn,auth,inline,dom,str,admin,stylelint,pwd,typeof,num,btn,concat,prev';
const _isDir = (path) => {
    const state = fs.statSync(path);
    return !state.isFile();
}
const getCheckerConfig = (rootPath) => {
    const vscodeConfigPath = path.join(rootPath, '.vscode/spell-checker-config.json');
    const projectConfigPath = path.join(rootPath, '.project/spell-checker-config.json');
    const basicWhiteList = basicWhiteWords.split(',');
    const basicConfig = {
        excludedDirNameSet: new Set(["node_modules", ".git"]),
        includedFileSuffixSet: new Set(),
        excludedFileNameSet: new Set([".DS_Store"]),
        whiteListSet: new Set(basicWhiteList)
    }
    let configPath;
    // support config file in .vscode or .project
    if(fs.existsSync(vscodeConfigPath)) {
        configPath = vscodeConfigPath;
    } else if(fs.existsSync(projectConfigPath)) {
        configPath = projectConfigPath;
    } else {
        return basicConfig;
    }
    try {
        // avoid parse error
        const config = JSON.parse(fs.readFileSync(configPath, {
            encoding: 'utf-8'
        }));
        // because of word cannot include spec chars
        // so whiteList support word connected by ‘,’ or word array
        basicConfig.excludedDirNameSet = config.excludedFloders ? new Set(config.excludedFloders) : basicConfig.excludedDirNameSet;
        basicConfig.includedFileSuffixSet = config.includedFileSubfixes ? new Set(config.includedFileSubfixes) : basicConfig.includedFileSuffixSet;
        basicConfig.excludedFileNameSet = config.excludedFileNames ? new Set(config.excludedFileNames) : basicConfig.excludedFileNameSet;
        if(config.whiteList instanceof Array) {
            basicConfig.whiteListSet = config.whiteList ? new Set(basicWhiteList.concat(config.whiteList)) : basicConfig.whiteListSet;
        } else {
            basicConfig.whiteListSet = config.whiteList ? new Set(basicWhiteList.concat(config.whiteList.split(','))) : basicConfig.whiteListSet;
        }
        return basicConfig;
    } catch(err) {
        return basicConfig;
    }
}

const getFileList = (dirPath, checkerConfig) => {
    let dirSubItems = fs.readdirSync(dirPath);
    const fileList = [];
    for (const item of dirSubItems) {
        const childPath = path.join(dirPath, item);
        if (_isDir(childPath) && !checkerConfig.excludedDirNameSet.has(item)) {
            fileList.push(...getFileList(childPath, checkerConfig));
        } else if (!_isDir(childPath) &&(checkerConfig.includedFileSuffixSet.size == 0 || checkerConfig.includedFileSuffixSet.has(path.extname(item))) && !checkerConfig.excludedFileNameSet.has(item)) {
            fileList.push(childPath);
        }
    }
    return fileList;
}

const getSpellingMistakeInfo =  (fileList, checkerConfig, rootPath) => {
    let currentWord = '';
    const mistakeInfoMap = new Map();
    // use set or map to improve performance
    const healthWordSet = new Set([...checkerConfig.whiteListSet]);
    // use to record word => suggestions & files reflect
    const mistakeWordMap = new Map();
    const handleCurrentWord = (file) => {
        const word = currentWord.toLowerCase();
        currentWord = '';
        if(word.length <= 1 || healthWordSet.has(word)) {
            return;
        }
        // it's not support windows, so change the check exe
        // if(dictionaryGB.spellCheck(word) || dictionaryUS.spellCheck(word)) {
        const suggestionsGB = dictionaryGB.getSuggestions(word, 5, 3).map(str => str.toLowerCase());
        const suggestionsUS = dictionaryUS.getSuggestions(word, 5, 3).map(str => str.toLowerCase());
        const suggestionsGbAndUs = [...new Set([...new Set([...suggestionsGB, ...suggestionsUS])])];
        if(suggestionsGbAndUs.indexOf(word) != -1) {
            healthWordSet.add(word);
            return;
        }
        let suggestions = suggestionsGbAndUs.join('/');
        if(mistakeWordMap.has(word)) {
            mistakeWordMap.get(word).files.add(file.replace(rootPath, ''));
        } else {
            mistakeWordMap.set(word, {suggestions,files: new Set([file.replace(rootPath, '')])});
        }
        const getBasicMistake = (word) => ({
            count: 1,
            word: new Map([[word, suggestions]])
        })
        if(!mistakeInfoMap.has(file)) {
            mistakeInfoMap.set(file, getBasicMistake(word));
        } else {
            const mistake = mistakeInfoMap.get(file);
            mistake.count++;
            mistake.word.set(word, suggestions);
        }
    };
    for (const file of fileList) {
        const content = fs.readFileSync(file, {
            encoding: 'utf-8'
        });
        for (const char of content) {
            if (/[a-z]/.test(char)) {
                currentWord += char;
            } else if (/[A-Z]/.test(char)) {
                if(/^[A-Z]+$/.test(currentWord)) {
                    currentWord += char;
                } else {
                    handleCurrentWord(file);
                    currentWord = char;
                }
            } else {
                if (currentWord) {
                    handleCurrentWord(file);
                }
            }
        }
    }
    const spellingMistakeInfo = [...mistakeInfoMap].map(item => ({
        name: path.basename(item[0]),
        path: item[0],
        info: {
            path: item[0],
            count: item[1].count,
            word: [...item[1].word].map(item => ({
                original: item[0],
                suggestion: item[1]
            }))
        }
    }))
    const mistakeWordInfo = [...mistakeWordMap].map(item => ({
        name: item[0],
        children: [...item[1].files].map(child => ({
            name: child,
            type: 'path'
        }))
    }))
    return {
        spellingMistakeInfo,
        mistakeWordInfo
    }
}

module.exports = {
    getCheckerConfig,
    getFileList,
    getSpellingMistakeInfo
}