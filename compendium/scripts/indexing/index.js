const buildDictionary = require('./dictionary');

const cliArgs = process.argv.slice(2);
if(cliArgs.length === 0) {
    console.error('Must include an operation to perform');
    process.exit(1);
} else {
    const op = cliArgs[0].toUpperCase();
    switch(op) {
        case 'ALL':
            buildDictionary();
            break;
        default:
            console.error(`Unknown operation '${op}'`);
            process.exit(1);
    }
}
console.log('=======================');
console.log('Normalization complete!');