import { existsSync } from "fs";
import path from "path";
import mustache from "mustache";
import { readFile } from "fs/promises";

const COMPONENTS_ROOT = path.resolve(".", "components");
const PAGES_ROOT = path.resolve(".", "pages");
const TEMPLATES_ROOT = path.resolve(".", "templates");
