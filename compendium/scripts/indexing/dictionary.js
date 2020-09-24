const Path = require('path');
const FS = require('fs');

const {
    TokenizeAndFilter,
    FilterLowercase,
    FilterDedup,
    FilterStopWords,
    FilterWords,
    FilterStemmer,
} = require('./tokenizer');

async function* walk(dir) {
    for await(const d of await FS.promises.opendir(dir)) {
        const entry = Path.join(dir, d.name);
        if(d.isDirectory()) yield* walk(entry);
        else if(d.isFile()) yield entry;
    }
}

async function processFile(file) {
    return new Promise((resolve, reject) => {
        console.log(`Reading file "${file}"`);
        FS.readFile(file, 'utf8', (err, data) => {
            if(err) return reject(err);

            data = JSON.parse(data);
            if(!data.type) return reject(new Error(`No type found on object ${file}`));

            const bulk = [];
            switch(data.type) {
                case 'ABILITY_SCORE':
                    bulk.push( data.name, data.description, data.abreviation );
                    break;
                case 'CONDITION':
                    bulk.push( data.name, data.description, ...data.effects );
                    break;
                case 'LANGUAGE':
                    bulk.push( data.name, data.description, data.script, ...data.speakers );
                    break;
                case 'MONSTER':
                    bulk.push( data.name, data.description || '' );

                    data.actions.forEach(act => bulk.push( act.name, act.description ));

                    if(data.legendaryActions && data.legendaryActions.options) {
                        data.legendaryActions.options.forEach(act => bulk.push( act.name, act.description ));
                    }

                    data.specialAbilities.forEach(act => bulk.push( act.name, act.description ));

                    break;
                case 'RACE':
                    bulk.push( 
                        data.name, 
                        data.description || '', 
                        data.alignment, 
                        data.age.description,
                        data.size.description,
                        data.languages.description
                    );
                    break;
                case 'SPELL':
                    bulk.push(
                        data.name,
                        data.description || '',
                        data.higherLevels || '',
                        data.components.cost || '',
                        (data.save ? data.save.extra || '' : '')
                    );
                    break;

                default:
                    bulk.push( data.name, data.description || '' );
                    break;
            }

            resolve( 
                TokenizeAndFilter(bulk.join(' '),
                    FilterLowercase,
                    FilterStopWords,
                    FilterWords,
                    FilterDedup,
                )
            );
        });
    });
}

async function buildDictionary() {
    let files = [];

    const dir = Path.resolve('..', '5e-SRD');
    console.log(`Reading directory "${dir}"`);
    for await(const file of walk(dir + Path.sep)) {
        if(!file.endsWith('.json'))
            continue;

        console.log(`Adding file "${file}"`);
        files.push( processFile(file) );
    }

    const dictionary = FilterDedup( (await Promise.all(files))
        .flat(2)
        .filter(res => {
            if(res instanceof Error || res.message || res.error) {
                console.error(`Error encountered: `, res);
                return false;
            }
            return !!(res && typeof res === 'string');
        })
    );

    dictionary.sort((a,b) => {
        const aLen = a.length, bLen = b.length;
        if(aLen > bLen) return 1;
        if(bLen > aLen) return -1;

        return a > b ? 1 : (a < b ? -1 : 0); 
    });

    const output = Path.resolve('..', 'indexes', 'dictionary.json');
    await FS.promises.writeFile(output, JSON.stringify(dictionary), 'utf8');

    console.log('Completed dictionary building');
}

module.exports = buildDictionary;

/*
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
*/