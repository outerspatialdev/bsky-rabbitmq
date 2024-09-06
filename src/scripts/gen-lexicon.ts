import { exec } from "node:child_process";
// load using import
import { glob } from "glob";

import { promisify } from "node:util";
const execAsync = promisify(exec);

// all js files, but don't look in node_modules
const lexiconFiles = await glob("external/atproto/lexicons/**/*.json");

const cmd = `npx lex gen-api --yes src/lexicon ${lexiconFiles.join(" ")}`;
console.log(cmd);
await execAsync(cmd);
