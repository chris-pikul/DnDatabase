#!/usr/bin/env node

require = require("esm")(module/*, options*/);
module.exports = require("../tools/convert.mjs").default(process.argv);