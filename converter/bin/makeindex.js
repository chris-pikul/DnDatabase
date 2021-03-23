#!/usr/bin/env node

require = require("esm")(module/*, options*/);
module.exports = require("../tools/makeindex.mjs").default(process.argv);