const Path = require('path');
const FS = require('fs');

const {
    TokenizeAndFilter,
    FilterLowercase,
    FilterDedup,
    FilterStopWords,
    FilterWords,
} = require('./tokenizer');

module.exports = () => {
    console.log('Building dictionary file');

    let dictionary = [];

    const dirPath = Path.resolve('..');
    const files = FS.readdirSync(dirPath, 'utf8');
    console.log('Reading source files: ', files);

    let filePath, fileStat, fileData, data, tokens = [], procString = [];
    for(const file of files) {
        filePath = Path.resolve('..', file);
        fileStat = FS.statSync(filePath);
        if(fileStat.isDirectory()) continue;

        console.log(`Reading file data for "${filePath}"`);
        fileData = FS.readFileSync(filePath, 'utf8');
        data = JSON.parse(fileData);
        console.log('Tokenizing for dictionary');

        procStr = [];
        if(Array.isArray(data)) {
            console.log(`Processing as array`);
            data.forEach(entry => {
                if(entry.name) procStr.push(entry.name);
                if(entry.description) procStr.push(entry.description);
            });
        } else if(typeof data === 'object') {
            console.log('Procecssing as object');

            if(data.name) procStr.push(data.name);
            if(data.description) procStr.push(data.description);
            if(data.subClasses && Array.isArray(data.subClasses) && data.subClasses.length > 0) {
                data.subClasses.forEach(sc => procStr.push(sc.description));
            }
        }
        tokens = tokens.concat( TokenizeAndFilter(procStr.join(' '),
                FilterLowercase,
                FilterStopWords,
                FilterWords,
            ) );

        dictionary = dictionary.concat(tokens);
        console.log(`Added ${tokens.length} tokens to the dictionary`);
    }

    //Clean up duplicates
    dictionary = FilterDedup(dictionary);
    dictionary.sort((a,b) => {
        const aLen = a.length, bLen = b.length;
        if(aLen > bLen) return 1;
        if(bLen > aLen) return -1;

        return a > b ? 1 : (a < b ? -1 : 0); 
    });
    
    const dictPath = Path.resolve('..', 'indexes', 'dictionary.json');
    console.log(`Writing dictionary data to "${dictPath}"`);
    const dictData = JSON.stringify(dictionary);
    FS.writeFileSync(dictPath, dictData, 'utf8');

    console.log('Completed dictionary building');
};