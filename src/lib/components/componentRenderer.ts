import { JSDOM } from "jsdom";
import { ComponentRegistry } from ".";

export interface ComponentRenderer {
  extractProps<T>(): T;
  findDependecies(): string[];
  render(): HTMLElement;
}

export class ComponentRendererJSDOM implements ComponentRenderer {
  private compName: string;
  private registry: ComponentRegistry;

  constructor(compName: string, registry: ComponentRegistry) {
    this.compName = compName;
    this.registry = registry;
  }

  public extractProps<T>(): T {
    const htmlEl = this.render();
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

  public findDependecies(): string[] {
    const htmlEl = this.render();
    const deps = new Set<string>();

    this._traverseElement(htmlEl, (el) => {
      const compName = el.nodeName.toUpperCase();
      if (this.registry.getComponent(compName)) {
        deps.add(compName);
      }
    });

    return Array.from(deps);
  }

  public render(): HTMLElement {
    const comp = this.registry.getComponent(this.compName);
    const dom = JSDOM.fragment(comp.html);
    return dom.firstChild as HTMLElement;
  }
}
