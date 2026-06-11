const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "lib", "data.ts");
let code = fs.readFileSync(dataPath, "utf-8");

// Move persist() before return statements
code = code.replace(/(\s*return[^;]*\n)(\s*persist\(\)\n)/g, "$2$1");

fs.writeFileSync(dataPath, code);
