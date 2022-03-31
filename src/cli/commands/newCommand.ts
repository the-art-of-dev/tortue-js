import { Command } from "commander";
import path from "path";
import simpleGit from "simple-git";
import fsSync from "fs";
import fs from "fs-extra";

import chalk from "chalk";

const log = console.log;
const logErr = (...text: any[]) => {
  log(chalk.red("[!]", ...text));
};
const logInfo = (...text: any[]) => {
  log(chalk.white("[*]", ...text));
};
const logSuccess = (...text: any[]) => {
  log(chalk.green("[+]", ...text));
};

export interface NewCommandOptions {
  force: boolean;
}

export class NewCommand extends Command {
  /**
   * New command creates new tortue default project setup
   */
  constructor() {
    super("new");
    this.description("Creates new tortue default project setup");
    this.argument(
      "[name]",
      "New project name(blank if new project is current directory)",
      "",
    );
    this.action(this._action);
    this.option("-f --force", "Overwrites existing project setup if exists");
  }

  private async _initGitRepo(repoPath: string): Promise<void> {
    if (fsSync.existsSync(path.resolve(repoPath, ".git"))) return;

    const git = simpleGit(repoPath);
    await git.init();
    await git.checkout(["-b", "main"]);
  }

  private async _initProjectFileStructure(
    repoPath: string,
    overwrite: boolean,
  ): Promise<void> {
    const projectName = path.basename(repoPath);

    await fs.copy(
      path.resolve(__dirname, "..", "default-project"),
      path.resolve(repoPath),
      {
        recursive: true,
        errorOnExist: true,
        overwrite: overwrite,
      },
    );

    const packageJSON = await fs.readJSON(
      path.resolve(repoPath, "package.json"),
    );

    packageJSON.name = projectName;
    const tortuePackageJSON = await fs.readJson(
      path.resolve(__dirname, "..", "package.json"),
    );
    packageJSON.devDependencies.tortue = `^${tortuePackageJSON.version}`;

    await fs.writeJson(path.resolve(repoPath, "package.json"), packageJSON, {
      spaces: 2,
    });
  }

  private async _action(name: string, opts: NewCommandOptions): Promise<void> {
    const newProjectPath = path.resolve(".", name);
    const overwrite = opts.force ?? false;

    try {
      await this._initProjectFileStructure(newProjectPath, overwrite);
      await this._initGitRepo(newProjectPath);
    } catch (error) {
      logErr(error);
      return;
    }

    logSuccess("Project successfully created ;)");
  }
}
