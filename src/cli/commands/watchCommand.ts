import { Command } from "commander";
import chokidar from "chokidar";
import { Tortue, TortuePipeline } from "@lib/tortue";
import { stdShells } from "@stdShells/stdShells";
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
export interface WatchCommandOptions {
  config: string; //json configuration file path
}

export class WatchCommand extends Command {
  /**
   * Watch command runs TortuePipeline build process on
   * every monitored data change.
   */
  constructor() {
    super("watch");
    this.description(
      "Runs tortue export pipeline when components, layouts or pages change",
    );
    this.option("-c --config <path>", "Specify configuration path");

    this.action(this._action);
  }

  private async _action(options: WatchCommandOptions) {
    const tortue = new Tortue(options.config);
    const defaultShells = stdShells;
    const pipeline = new TortuePipeline(tortue, defaultShells);
    await pipeline.execute();
    logSuccess("Export pipeline finished!");

    const watcher = chokidar.watch([
      tortue.config.componentsDir,
      tortue.config.layoutsDir,
      tortue.config.pagesDir,
    ]);

    logInfo("Watching.....");

    let isReady = false;

    watcher.on("ready", () => {
      if (isReady) return;
      isReady = true;
      watcher.on("all", async () => {
        await pipeline.execute();
        logSuccess("Export pipeline finished!");
      });
    });
  }
}
