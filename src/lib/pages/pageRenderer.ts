import { JSDOM } from "jsdom";
import { Page } from ".";
import { ComponentRegistry } from "../components";

export interface RenderPageOptions {
  destPath: string;
}

export class PageRenderer {
  private page: Page;
  private registry: ComponentRegistry;
  private opts: RenderPageOptions;

  constructor(
    page: Page,
    registry: ComponentRegistry,
    opts: RenderPageOptions,
  ) {
    this.page = page;
    this.registry = registry;
    this.opts = opts;
  }

  private _traverseElement(
    el: HTMLElement,
    callback: (el: HTMLElement) => void,
  ) {
    if (!el) return;
    for (let i = 0; i < el.children.length; i++) {
      const child = el.children[i];
      this._traverseElement(child as HTMLElement, callback);
    }
    callback(el);
  }

  public render() {
    const dom = new JSDOM(this.page.html);
    const deps: string[] = [];
    this._traverseElement(dom.window.document.body, (el) => {
      const compName = el.nodeName.toUpperCase();
      const comp = this.registry.getComponent(compName);
      if (!comp) return;

      // const compRenderer = new ComponentRendererJSDOM(compName, this.registry);
      // const compDeps = compRenderer.findDependecies();
      // for (const dep of compDeps) {
      //   if (deps.includes(dep)) continue;
      //   deps.push(dep);
      // }
      // deps.push(compName);
    });

    console.log(deps);
  }
}
