import { Tortue } from "@lib/tortue";
import { TortuePipeline } from "@lib/tortue/tortuePipeline";
import { Command } from "commander";
import exportHTMLShell from "@stdShells/exportHTML";
import exportAssets from "@stdShells/exportAssets";
import intellisenseVSC from "@stdShells/intellisenseVSC";
import { TortueShell } from "@lib/tortueShells";
import { stdShells } from "@stdShells/stdShells";

export interface ExportCommandOptions {
  config: string; //json configuration file path
}

export class ExportCommand extends Command {
  /**
   * Export command runs TortuePipeline build process
   */
  constructor() {
    super("export");
    this.description("Runs tortue export pipeline process");
    this.option("-c --config <path>", "Specify configuration path");

    this.action(this._action);
  }

  private async _action(options: ExportCommandOptions): Promise<void> {
    const tortue = new Tortue(options.config);
    const defaultShells = stdShells;
    const pipeline = new TortuePipeline(tortue, defaultShells);
    await pipeline.execute();
  }
}
