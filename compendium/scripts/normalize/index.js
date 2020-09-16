const fs = require('fs');
const path = require('path');

const processSpells = require('./process-spells');
const processAbilities = require('./process-abilities');
const processClasses = require('./process-classes');
const processConditions = require('./process-conditions');
const processDamageTypes = require('./process-damage-types');
const processEquipment = require('./process-equipment');
const processLangs = require('./process-langs');
const processSchools = require('./process-schools');
const processSkills = require('./process-skills');
const processWeaponProperties = require('./process-weapon-properties');
const processTraits = require('./process-traits');

function normalize(inFile, outFile, procFunc) {
    const pathIn = path.resolve( '..', 'raw', inFile);
    console.log(`Reading data from path "${pathIn}"`);
    const rawData = fs.readFileSync(pathIn);
    const data = JSON.parse(rawData);

    console.log(`Processing data...`);
    const output = procFunc(data);

    if(output) {
        const pathOut = path.resolve( '..', outFile);
        console.log(`Writing data to path "${pathOut}"`);
        const outData = JSON.stringify(output, null, 2);
        fs.writeFileSync(pathOut, outData, 'utf8', 777);
    } //null output means we handled it there
}

const cliArgs = process.argv.slice(2);
if(cliArgs.length === 0) {
    console.error('Must include an operation to perform');
    process.exit(1);
} else {
    const op = cliArgs[0].toUpperCase();
    switch(op) {
        case 'ALL':
            normalize( '5e-SRD-Ability-Scores.json', 'ability-scores.json', processAbilities);
            normalize( '5e-SRD-Classes.json', 'classes.json', processClasses);
            normalize( '5e-SRD-Conditions.json', 'conditions.json', processConditions);
            normalize( '5e-SRD-Damage-Types.json', 'damage-types.json', processDamageTypes);
            normalize( '5e-SRD-Equipment.json', 'equipment.json', processEquipment);
            normalize( '5e-SRD-Spells.json', 'spells.json', processSpells );
            normalize( '5e-SRD-Languages.json', 'languages.json', processLangs);
            normalize( '5e-SRD-Magic-Schools.json', 'magic-schools.json', processSchools);
            normalize( '5e-SRD-Skills.json', 'skills.json', processSkills);
            normalize( '5e-SRD-Weapon-Properties.json', 'weapon-properties.json', processWeaponProperties);
            normalize( '5e-SRD-Traits.json', 'traits.json', processTraits);
            break;
        case 'ABILITIES':
            normalize( '5e-SRD-Ability-Scores.json', 'ability-scores.json', processAbilities);
            break;
        case 'CLASSES':
            normalize( '5e-SRD-Classes.json', 'classes.json', processClasses);
            break;
        case 'CONDITIONS':
            normalize( '5e-SRD-Conditions.json', 'conditions.json', processConditions);
            break;
        case 'DAMAGE-TYPES':
            normalize( '5e-SRD-Damage-Types.json', 'damage-types.json', processDamageTypes);
            break;
        case 'EQUIPMENT':
            normalize( '5e-SRD-Equipment.json', 'equipment.json', processEquipment);
            break;
        case 'SPELLS':
            normalize( '5e-SRD-Spells.json', 'spells.json', processSpells );
            break;
        case 'LANG':
        case 'LANGS':
        case 'LANGUAGES':
            normalize( '5e-SRD-Languages.json', 'languages.json', processLangs);
            break;
        case 'SCHOOLS':
        case 'MAGIC-SCHOOLS':
            normalize( '5e-SRD-Magic-Schools.json', 'magic-schools.json', processSchools);
            break;
        case 'SKILLS':
            normalize( '5e-SRD-Skills.json', 'skills.json', processSkills);
            break;
        case 'WEAPON-PROPS':
        case 'WEAPON-PROPERTIES':
            normalize( '5e-SRD-Weapon-Properties.json', 'weapon-properties.json', processWeaponProperties);
            break;
        case 'TRAITS':
            normalize( '5e-SRD-Traits.json', 'traits.json', processTraits);
            break;
        default:
            console.error(`Unknown operation '${op}'`);
            process.exit(1);
    }
}
console.log('=======================');
console.log('Normalization complete!');