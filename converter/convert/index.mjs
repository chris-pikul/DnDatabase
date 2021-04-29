import Chalk from 'chalk';

import { BindToProcess } from '../reporting.mjs';
import { ObjectMappings } from '../utils/index.mjs';

console.log(`Converting source files from 5eTools into dndatabase format...`);

// Bind the necessary process events.
// This includes the error reporting at the end, for printing the results.
BindToProcess();

// Get the process arguments, normalize them by lowercase/trimming them.
// For this program, the arguments are treated as a list of objects to process,
// an empty set (no arguments) is treated as an implicit all
const args = process.argv.slice(2)
    .map(arg => arg.toLowerCase().trim());

/**
 * Each "import" is considered a processor of an object type (spell, race, class, etc.)
 * and is imported as its default (a singular function).
 * 
 * As this is a singular step, no validation or indexing is performed (thats another command).
 * 
 * The basic concept is, each "command" or object type returns a promise that when resolved
 * will produce an array of promises. This is the "prep" step in conversion which essentially
 * loads the requisite data and types and prepares to start conversion.
 * 
 * From there, the program is expected to flatten these promises and await on all of them.
 */
import AbilityScore from './ability-score.mjs';

// Map the commands to their promises
const map = {
    'ability-scores': AbilityScore,
};

// Prep for performance
const progStart = process.hrtime();

let prepPromises = [];
if(args.length > 0) {
    prepPromises = args
        .filter(arg => map.hasOwnProperty(arg))
        .map(arg => map[arg]());
    
    if(prepPromises.length === 0) {
        console.log( Chalk.bgRed.whiteBright(`No valid object types where supplied, please try again.`));
        process.exit(1);
    }
} else { // No arguments, so do everything
    prepPromises = Object.keys(map).map(key => map[key]());
}

const procPromises = await Promise.allSettled(prepPromises);

// Output program performance
const progElaps = process.hrtime(progStart);
const progPerf = (progElaps[1] / 1000000).toFixed(4);
console.log( Chalk.blueBright(`Total time of conversion processing: ${progPerf}ms`));