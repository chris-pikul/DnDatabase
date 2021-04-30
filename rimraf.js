const Path = require('path');
const RimRaf = require('rimraf');

console.log('Cleaning project files...');

RimRaf(Path.resolve('.', 'types'), {}, (err) => {
    if(err) console.error(err);
    else console.log('Cleaning complete!');
});