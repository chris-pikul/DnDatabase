import Chalk from 'chalk';

import { BindToProcess } from '../reporting.mjs';

console.log( Chalk.blueBright(`Converting source files from 5eTools into dndatabase format`) );

// Bind the necessary process events.
// This includes the error reporting at the end, for printing the results.
BindToProcess();

