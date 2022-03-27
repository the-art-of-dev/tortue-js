import { TortueShell } from "@lib/tortueShells";
import { TortueShellActionData } from "@lib/tortueShells/tortueShell";
import { TortuePipelineEvent } from "./events";
import { Tortue } from "./tortue";

export class TortuePipeline {
  private _shells: TortueShell[];
  private _tortue: Tortue;

  /**
   *
   */
  constructor(tortue: Tortue, shells: TortueShell[]) {
    this._shells = shells ?? [];
    this._tortue = tortue;
  }

  public async execute(): Promise<void> {
    //load config
    await this._tortue.loadConfig();

    //load shells
    await this._tortue.loadShells();
    this._shells.push(...this._tortue.shells);

    await this.runShells(TortuePipelineEvent.CONFIG_LOADED);

    //build components
    await this._tortue.buildComponents();
    await this.runShells(TortuePipelineEvent.COMPONENTS_BUILT);

    //build layouts
    await this._tortue.buildLayouts();
    await this.runShells(TortuePipelineEvent.LAYOUTS_BUILT);

    //build pages
    await this._tortue.buildPages();
    await this.runShells(TortuePipelineEvent.PAGES_BUILT);

    //render pages
    await this._tortue.renderPages();
    await this.runShells(TortuePipelineEvent.RENDER_FINISHED);
  }

  private get tortueShellActionData(): TortueShellActionData {
    return {
      config: this._tortue.config,
      layouts: this._tortue.layouts,
      pages: this._tortue.pages,
      registry: this._tortue.componentRegistry,
    };
  }

  private set tortueShellActionData(data: TortueShellActionData) {
    this._tortue.config = data.config;
    this._tortue.componentRegistry = data.registry;
    this._tortue.layouts = data.layouts;
    this._tortue.pages = data.pages;
  }

  public async runShells(event: TortuePipelineEvent): Promise<void> {
    let data = this.tortueShellActionData;

    const shells = this._shells.filter((s) => s.actions[event]);
    const actions = shells.map((s) => s.actions[event]);

    while (actions.length) {
      data = await actions.shift()(data);
    }

    this.tortueShellActionData = data;
  }
}
