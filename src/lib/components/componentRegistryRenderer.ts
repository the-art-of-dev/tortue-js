import { JSDOM } from "jsdom";
import { ComponentRegistry } from ".";

export interface ComponentRegistryRenderer {
  extractProps<T>(el: HTMLElement): T;
  findDependecies(el: HTMLElement): string[];
  render(el: HTMLElement): HTMLElement;
  renderComponent(compName: string): HTMLElement;
  findComponentDependecies(compName: string): string[];
}

export class ComponentRegisterRendererJSDOM
  implements ComponentRegistryRenderer
{
  private registry: ComponentRegistry;

  constructor(registry: ComponentRegistry) {
    this.registry = registry;
  }

  public extractProps<T>(htmlEl: HTMLElement): T {
    const props = {};

    for (let i = 0; i < htmlEl.attributes.length; i++) {
      const attr = htmlEl.attributes.item(i);
      props[attr.name] = attr.value;
    }

    return props as T;
  }

  private _traverseElement(
    el: HTMLElement,
    callback: (el: HTMLElement) => void,
  ) {
    if (!el) return;
    callback(el);
    for (let i = 0; i < el.children.length; i++) {
      const child = el.children[i];
      this._traverseElement(child as HTMLElement, callback);
    }
  }

  public findDependecies(htmlEl: HTMLElement): string[] {
    const deps = new Set<string>();

    this._traverseElement(htmlEl, (el) => {
      const compName = el.nodeName.toUpperCase();
      const comp = this.registry.getComponent(compName);
      if (comp) {
        deps.add(comp.name);
      }
    });

    return Array.from(deps);
  }

  public findComponentDependecies(componentName: string): string[] {
    const htmlEl = this.renderComponent(componentName);
    return this.findDependecies(htmlEl);
  }

  public render(el: HTMLElement): HTMLElement {
    const comp = this.registry.getComponent(el.nodeName);
    if (!comp) return null;
    const dom = JSDOM.fragment(comp.html);
    return dom.firstChild as HTMLElement;
  }

  public renderComponent(componentName: string): HTMLElement {
    const comp = this.registry.getComponent(componentName);
    if (!comp) return null;
    const dom = JSDOM.fragment(comp.html);
    return dom.firstChild as HTMLElement;
  }
}
