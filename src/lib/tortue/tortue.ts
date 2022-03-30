import { ComponentBuilder, ComponentRegistry } from "@lib/components";
import { Layout, LayoutBuilder } from "@lib/layouts";
import { Page, PageBuilder, renderPage } from "@lib/pages";
import { buildTortueShells, TortueShell } from "@lib/tortueShells";
import { DEFAULT_TORTUE_CONFIG, TortueConfig } from "./tortueConfig";
import fsSync from "fs";
import fs from "fs/promises";
import path from "path";
import { findPageLayout } from "@lib/layouts/layout";

export class Tortue {
  private _config: TortueConfig;
  private _shells: TortueShell[];
  private _configPath: string;
  private _componentRegistry: ComponentRegistry;
  private _layouts: Layout[];
  private _pages: Page[];
  private _replaceShells: boolean;

  /**
   *
   */
  constructor(configPath: string) {
    this._configPath = configPath;
    this.shells = [];
    this._replaceShells = false;
  }

  private async _readConfig(configPath: string): Promise<TortueConfig> {
    configPath = path.resolve(configPath);
    if (!fsSync.existsSync(configPath)) return null;
    const config = JSON.parse(
      (await fs.readFile(configPath)).toString(),
    ) as unknown as TortueConfig;

    return config;
  }

  public async loadConfig(): Promise<void> {
    if (!this._configPath) {
      this.config = DEFAULT_TORTUE_CONFIG;
      return;
    }

    const newConfig = await this._readConfig(this._configPath);
    this.config = newConfig ?? DEFAULT_TORTUE_CONFIG;

    if (this.config.shellsConfig) {
      this._replaceShells = true;
    } else {
      this.config.shellsConfig = [];
    }
  }

  public async loadShells(): Promise<void> {
    this.shells = await buildTortueShells(this.config.shellsConfig);
    this.shells = this.shells.filter((s) => s);
  }

  public async buildComponents(): Promise<void> {
    const builder = new ComponentBuilder(this.config.componentsDir);
    this.componentRegistry = await builder.buildAllComponents();
  }

  public async buildLayouts(): Promise<void> {
    const builder = new LayoutBuilder(this.config.layoutsDir);
    this.layouts = await builder.buildAll();
  }

  public async buildPages(): Promise<void> {
    const builder = new PageBuilder(this.config.pagesDir);
    this.pages = await builder.buildPages();
  }

  public async renderPages(): Promise<void> {
    const newPages = [];
    for (let page of this.pages) {
      newPages.push(
        await renderPage(
          page,
          this.componentRegistry,
          findPageLayout(page.name, this._layouts),
        ),
      );
    }
    this.pages = newPages;
  }

  public get config(): TortueConfig {
    return this._config;
  }

  public get shells(): TortueShell[] {
    return this._shells;
  }

  public get replaceShells(): boolean {
    return this._replaceShells;
  }

  public get configPath(): string {
    return this._configPath;
  }

  public get componentRegistry(): ComponentRegistry {
    return this._componentRegistry;
  }

  public get layouts(): Layout[] {
    return this._layouts;
  }

  public get pages(): Page[] {
    return this._pages;
  }

  public set config(config: TortueConfig) {
    this._config = config;
  }

  public set shells(shells: TortueShell[]) {
    this._shells = shells;
  }

  public set componentRegistry(registry: ComponentRegistry) {
    this._componentRegistry = registry;
  }

  public set layouts(layouts: Layout[]) {
    this._layouts = layouts;
  }

  public set pages(pages: Page[]) {
    this._pages = pages;
  }
}

//load Conifg
//afterConfigLoad
//load shells
//buildComponents
//afterComponentsBuiltShells
//buildLayouts
//buildPages
//
//runShells
