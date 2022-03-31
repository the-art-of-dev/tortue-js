import { Command } from "commander";
import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import { Tortue } from "@lib/tortue";
import Mustache from "mustache";

const log = console.log;
const logErr = (...text: any[]) => {
  log(chalk.red("[!]", ...text));
};
const logSuccess = (...text: any[]) => {
  log(chalk.green("[+]", ...text));
};

enum TemplateType {
  component = "comp",
  page = "page",
}

async function getTemplatePath(type: TemplateType): Promise<string> {
  const templatePath = path.resolve(__dirname, "..", "templates", type);
  if (!fs.existsSync(templatePath))
    throw new Error("Template directory not found!");
  return templatePath;
}

async function createFromTemplate(
  type: TemplateType,
  name: string,
  includeFiles: string[], //template parts
  outputRoot: string,
) {
  const templatePath = await getTemplatePath(type);
  const outputPath = path.resolve(outputRoot, name.split("-").join(path.sep));

  await fs.mkdirp(outputPath);
  await fs.copy(templatePath, outputPath, {
    recursive: true,
    overwrite: false,
    filter: (x) => includeFiles.includes(path.basename(x)),
  });

  for (const fileName of includeFiles) {
    if (fileName == type) continue;
    const filePath = path.resolve(outputPath, fileName);
    if (!fs.existsSync(filePath)) continue;
    let content = (await fs.readFile(filePath)).toString();
    content = Mustache.render(content, {
      name: name.toLowerCase(),
    });

    await fs.writeFile(filePath, content);
  }
}

interface CreateCommandOptions {
  style: boolean;
  js: boolean;
  doc: boolean;
  config: string;
}

export class CreateCommand extends Command {
  /**
   * Create command helps you create components, pages based on templates
   */
  constructor() {
    super("create");
    this.description("Create command helps you create components, pages");
    this.argument("<type>", "Template type: comp | page");
    this.argument("<name>", "");
    this.option("-c --config <path>", "Specify configuration path");
    this.option("-s --style", "Creates style from template");
    this.option("-j --js", "Creates script from template");
    this.option("-d --doc", "Creates documentation from template");

    this.action(this._action);
  }

  private async _action(
    type: TemplateType,
    name: string,
    opts: CreateCommandOptions,
  ): Promise<void> {
    const tortue = new Tortue(opts.config);
    await tortue.loadConfig();
    const outputRoot = {
      [TemplateType.component]: tortue.config.componentsDir,
      [TemplateType.page]: tortue.config.pagesDir,
    };

    const includeFiles = [type, "index.html"];

    if (opts?.style) {
      includeFiles.push("style.css");
    }

    if (opts?.js) {
      includeFiles.push("script.js");
    }

    if (opts?.doc && type == TemplateType.component) {
      includeFiles.push("doc.md");
    }

    try {
      await createFromTemplate(type, name, includeFiles, outputRoot[type]);
    } catch (error) {
      logErr(error);
    }
  }
}
