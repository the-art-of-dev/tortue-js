import { ComponentRegistry } from "../components";
import { TortueShell } from "./tortueShell";

export class TortueShellQueue {
  private queue: TortueShell[];

  /**
   *
   */
  constructor(shells: TortueShell[]) {
    this.queue = shells ?? [];
  }

  public async processAfterCompile(
    registry: ComponentRegistry,
  ): Promise<ComponentRegistry> {
    for (const shell of this.queue) {
      registry = await shell.afterCompile(registry);
    }

    return registry;
  }
}
