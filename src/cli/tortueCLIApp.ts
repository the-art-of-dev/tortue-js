import { Command, OptionValues } from "commander";
import { ExportCommand } from "./commands/exportCommand";
import { NewCommand } from "./commands/newCommand";
import { WatchCommand } from "./commands/watchCommand";
import { CreateCommand } from "./commands/createCommand";

export class TortueCLIApp {
  private _program: Command;
  private _exportCommand: Command;
  private _importCommand: Command;
  private _watchCommand: Command;
  private _createCommand: Command;

  /**
   * CLI provides export, import and watch commands.
   */
  constructor() {
    this._program = new Command("tortue");
    this._exportCommand = new ExportCommand();
    this._importCommand = new NewCommand();
    this._watchCommand = new WatchCommand();
    this._createCommand = new CreateCommand();
    this._program.addCommand(this._exportCommand);
    this._program.addCommand(this._importCommand);
    this._program.addCommand(this._watchCommand);
    this._program.addCommand(this._createCommand);
  }

  public parseOptions(): OptionValues {
    this._program.parse();
    return this._program.opts();
  }
}
