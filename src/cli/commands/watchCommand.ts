import { Command } from "commander";

export class WatchCommand extends Command {
  /**
   * Watch command runs TortuePipeline build process on
   * every monitored data change.
   */
  constructor() {
    super("watch");
  }
}
