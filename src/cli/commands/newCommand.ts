import { Command } from "commander";
import path from "path";
import simpleGit from "simple-git";
import fs from "fs/promises";
import fsSync, { read } from "fs";
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

export class NewCommand extends Command {
  /**
   * New command creates new tortue default project setup
   */
  constructor() {
    super("new");
    this.argument("<name>", "New project name");
    this.action(this._action);
  }

  private async _initGitRepo(repoPath: string): Promise<void> {
    const git = simpleGit(repoPath);
    await git.init();
    await git.checkout(["-b", "main"]);

    const readmePath = path.resolve(repoPath, "README.md");
    await fs.writeFile(readmePath, `# ${path.basename(repoPath)}` + "\n");

    const gitignoreTemplate = `.DS_Store
dist
node_modules
reports
components-html-custom-data.json
dist-*
`;
    const gitignorePath = path.resolve(repoPath, ".gitignore");
    await fs.writeFile(gitignorePath, gitignoreTemplate);
  }

  private async _createProjectDir(repoPath: string): Promise<boolean> {
    if (fsSync.existsSync(repoPath)) return false;

    await fs.mkdir(repoPath, {
      recursive: true,
    });

    return true;
  }

  private async _createPackageJSON(repoPath: string) {
    const porjectName = path.basename(repoPath);
    const packageJSONTemplate = `{
  "name": "${porjectName}",
  "version": "1.0.0",
  "description": "${porjectName} Project",
  "main": "index.js",
  "scripts": {
    "build": "tortue export -c tortue.config.json",
    "dev": "tortue watch -c tortue.config.json"
  },
  "devDependencies": {
    "prettier": "2.5.1",
    "tortue": "^1.0.0"
  }
}
`;

    await fs.writeFile(
      path.resolve(repoPath, "package.json"),
      packageJSONTemplate,
    );
  }

  private async _createVSCodeSettings(repoPath: string) {
    await fs.mkdir(path.resolve(repoPath, ".vscode"), {
      recursive: true,
    });

    const settingsJSONTemplate = `{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[html]": {
    "editor.suggest.insertMode": "replace",
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  }
}
`;

    await fs.writeFile(
      path.resolve(repoPath, ".vscode", "settings.json"),
      settingsJSONTemplate,
    );
  }

  private async _createPrettierSettings(repoPath: string) {
    const prettierTemplate = `{
  "trailingComma": "all",
  "tabWidth": 2,
  "semi": true,
  "singleQuote": false,
  "printWidth": 80
}
`;

    await fs.writeFile(
      path.resolve(repoPath, ".prettierrc.json"),
      prettierTemplate,
    );
  }

  private async _createDefaultLayout(repoPath: string) {
    await fs.mkdir(path.resolve(repoPath, "layouts"), {
      recursive: true,
    });

    const layoutTemplate = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>

  {{head}}
</head>

<body>

</body>

</html>
`;

    await fs.writeFile(
      path.resolve(repoPath, "layouts", "layout.html"),
      layoutTemplate,
    );
  }

  private async _createDefaultTortueConfig(repoPath: string) {
    const tortueConfigTemplate = `{
  "componentsDir": "components",
  "layoutsDir": "layouts",
  "pagesDir": "pages",
  "shellsConfig": [
    {
      "name": "intellisense-vsc"
    },
    {
      "name": "export-html"
    },
    {
      "name": "export-assets"
    }
  ]
}    
`;

    await fs.writeFile(
      path.resolve(repoPath, "tortue.config.json"),
      tortueConfigTemplate,
    );
  }

  private async _initProjectFileStructure(repoPath: string): Promise<void> {
    await this._createPackageJSON(repoPath);
    await this._createVSCodeSettings(repoPath);
    await this._createPrettierSettings(repoPath);
    await this._createDefaultTortueConfig(repoPath);

    await fs.mkdir(path.resolve(repoPath, "components"), {
      recursive: true,
    });

    await this._createDefaultLayout(repoPath);

    await fs.mkdir(path.resolve(repoPath, "pages"), {
      recursive: true,
    });
  }

  private async _action(name: string): Promise<void> {
    const newProjectPath = path.resolve(".", name);
    const projectDirCreated = await this._createProjectDir(newProjectPath);

    if (!projectDirCreated) {
      logErr("Can't create new directory for your project :'(");
      logErr("Try removing directory if already exist");
      return;
    }

    await this._initGitRepo(newProjectPath);
    await this._initProjectFileStructure(newProjectPath);

    logSuccess("Project successfully created ;)");
  }
}
