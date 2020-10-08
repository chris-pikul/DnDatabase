const buildDictionary = require('./dictionary');
const buildURLs = require('./urls');
const buildIndex = require('./dict-url');

const cliArgs = process.argv.slice(2);
if(cliArgs.length === 0) {
    console.error('Must include an operation to perform');
    process.exit(1);
} else {
    const op = cliArgs[0].toUpperCase();
    switch(op) {
        case 'ALL':
            buildDictionary();
            buildURLs();
            buildIndex();
            break;
        case 'DICTIONARY':
            buildDictionary();
            break;
        case 'URLS':
            buildURLs();
            break;
        case 'INDEX':
            buildIndex();
            break;
        default:
            console.error(`Unknown operation '${op}'`);
            process.exit(1);
    }
}
console.log('=======================');
console.log('Normalization complete!');