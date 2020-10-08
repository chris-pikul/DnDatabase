const Path = require('path');
const FS = require('fs');

const { FilterDedup } = require('./tokenizer');

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
            if(!data.url) return reject(new Error(`No url found on object ${file}`));

            resolve(data.url);
        });
    });
}

async function buildURLs() {
    let files = [];

    const dir = Path.resolve('..', '5e-SRD');
    console.log(`Reading directory "${dir}"`);
    for await(const file of walk(dir + Path.sep)) {
        if(!file.endsWith('.json'))
            continue;

        console.log(`Adding file "${file}"`);
        files.push( processFile(file) );
    }

    const urls = FilterDedup((await Promise.all(files))
        .flat(2)
        .filter(res => {
            if(res instanceof Error || res.message || res.error) {
                console.error(`Error encountered: `, res);
                return false;
            }
            return !!(res && typeof res === 'string');
        })
    );

    const output = Path.resolve('..', 'indexes', 'urls.json');
    await FS.promises.writeFile(output, JSON.stringify(urls, null, 2), 'utf8');

    console.log('Completed dictionary building');
}

module.exports = buildURLs;