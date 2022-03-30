import path from "path";
import { Context, ContextTreeBuilder } from "@lib/contexts";
import fsSync from "fs";
import { promisify } from "util";
const fs = {
  readFile: promisify(fsSync.readFile),
  writeFile: promisify(fsSync.writeFile),
  mkdir: promisify(fsSync.mkdir),
};
import { Component } from "./component";
import { ComponentRegistry, MapComponentRegistry } from "./componentRegistry";

export class ComponentBuilder {
  private componentsRoot: string;

  constructor(componentsRoot: string) {
    this.componentsRoot = componentsRoot;
  }

  public async getComponentsContexts(): Promise<Context[]> {
    const treeBuilder = new ContextTreeBuilder(this.componentsRoot);
    const tree = await treeBuilder.build();

    const componentContexts: Context[] = tree
      .findLeafNodes()
      .map((n) => n.data);

    return componentContexts;
  }

  private async buildComponentHtml(componentDir: string): Promise<string> {
    const htmlPath = path.resolve(componentDir, "index.html");
    const isHtml = fsSync.existsSync(htmlPath);
    return isHtml ? (await fs.readFile(htmlPath)).toString() : null;
  }
  private async buildComponentCss(componentDir: string): Promise<string> {
    const cssPath = path.resolve(componentDir, "style.css");
    const isCss = fsSync.existsSync(cssPath);
    return isCss ? (await fs.readFile(cssPath)).toString() : null;
  }

  private async buildComponentJs(componentDir: string): Promise<string> {
    const jsPath = path.resolve(componentDir, "script.js");
    const isJs = fsSync.existsSync(jsPath);
    return isJs ? (await fs.readFile(jsPath)).toString() : null;
  }

  private async buildComponentDoc(componentDir: string): Promise<string> {
    const docPath = path.resolve(componentDir, "doc.md");
    const isDoc = fsSync.existsSync(docPath);
    return isDoc ? (await fs.readFile(docPath)).toString() : null;
  }

  private async buildAllComponentParts(
    componentDir: string,
  ): Promise<{ html: string; css: string; js: string; doc: string }> {
    return {
      html: await this.buildComponentHtml(componentDir),
      css: await this.buildComponentCss(componentDir),
      js: await this.buildComponentJs(componentDir),
      doc: await this.buildComponentDoc(componentDir),
    };
  }

  public async buildComponent(compContext: Context): Promise<Component> {
    const { html, css, js, doc } = await this.buildAllComponentParts(
      compContext.path,
    );
    const isComponent = html || css || js;
    if (!isComponent) return null;

    return {
      name: compContext.name,
      html,
      css,
      js,
      doc,
      dependecies: [],
    };
  }

  public async buildAllComponents(): Promise<ComponentRegistry> {
    const componentContexts = await this.getComponentsContexts();
    const components: Component[] = [];

    for (const context of componentContexts) {
      const component = await this.buildComponent(context);
      if (component) components.push(component);
    }

    const registry = new MapComponentRegistry(components);
    // for (const comp of components) {
    //   const rndr = new ComponentRendererJSDOM(comp.name, registry);
    //   comp.dependecies = rndr.findDependecies();
    // }

    return registry;
  }
}
