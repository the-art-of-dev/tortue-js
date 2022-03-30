#!/usr/bin/env zx

import { readFile, rm, writeFile } from "fs/promises";
import { existsSync } from "fs";

if (existsSync("./bin")) await rm("./bin", { recursive: true });
await $`rollup -c rollup.config.cli.js`;
const app = (await readFile("./bin/app.js")).toString();
await writeFile("./bin/app.js", `#!/usr/bin/env node\n${app}`);
