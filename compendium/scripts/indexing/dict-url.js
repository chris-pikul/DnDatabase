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

            const tokens = TokenizeAndFilter(bulk.join(' '),
                FilterLowercase,
                FilterStopWords,
                FilterWords,
                FilterStemmer,
                FilterDedup,
            );

            resolve({
                url: data.url,
                tokens,
            });
        });
    });
}

async function buildIndex() {
    let files = [];

    const dir = Path.resolve('..', '5e-SRD');
    console.log(`Reading directory "${dir}"`);
    for await(const file of walk(dir + Path.sep)) {
        if(!file.endsWith('.json'))
            continue;

        console.log(`Adding file "${file}"`);
        files.push( processFile(file) );
    }

    const results = (await Promise.all(files))
        .flat(2)
        .filter(res => {
            if(res instanceof Error || res.message || res.error) {
                console.error(`Error encountered: `, res);
                return false;
            }
            return !!res;
        });

    const dictionary = results.map(entry => (entry.tokens)).flat(2);
    dictionary.sort((a,b) => {
        const aLen = a.length, bLen = b.length;
        if(aLen > bLen) return 1;
        if(bLen > aLen) return -1;

        return a > b ? 1 : (a < b ? -1 : 0); 
    });

    const indices = {};
    dictionary.forEach(word => { indices[word] = []; });

    results.forEach( ({ url, tokens }) => tokens.forEach( token => {
        if( !indices[token].includes(url) )
            indices[token].push(url);
    }) );

    const output = Path.resolve('..', 'indexes', 'dict-urls.json');
    await FS.promises.writeFile(output, JSON.stringify(indices, null, 2), 'utf8');

    console.log('Completed index building');
}

module.exports = buildIndex;
