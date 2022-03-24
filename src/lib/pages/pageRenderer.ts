import { JSDOM } from "jsdom";
import { Page } from ".";
import {
  ComponentRegisterRendererJSDOM,
  ComponentRegistry,
  ComponentRegistryRenderer,
} from "../components";

export interface RenderPageOptions {
  destPath: string;
}

function traverseElement(el: HTMLElement, callback: (el: HTMLElement) => void) {
  if (!el) return;
  for (let i = 0; i < el.children?.length ?? 0; i++) {
    const child = el.children[i];
    traverseElement(child as HTMLElement, callback);
  }

  callback(el);
}

function renderElement(
  el: HTMLElement,
  registry: ComponentRegistry,
  depList: Set<string>,
  crr: ComponentRegisterRendererJSDOM,
) {
  const comp = registry.getComponent(el.nodeName);
  if (!comp) return;
  const rendered = crr.render(el);
  el.replaceWith(rendered);
  traverseElement(rendered, (el) => renderElement(el, registry, depList, crr));
  depList.add(comp.name);
}

export function renderPage(page: Page, registry: ComponentRegistry): Page {
  const crr = new ComponentRegisterRendererJSDOM(registry);
  const dom = new JSDOM(page.html);
  const dependecyList = new Set<string>();
  const renderedPage = { ...page };

  for (const child of dom.window.document.body.childNodes) {
    traverseElement(child as HTMLElement, (el: HTMLElement) =>
      renderElement(el, registry, dependecyList, crr),
    );
  }

  let css = "";
  let js = "";
  for (const dep of dependecyList) {
    css += registry.getComponent(dep).css ?? "";
    js += registry.getComponent(dep).js ?? "";
  }

  renderedPage.html = dom.window.document.documentElement.outerHTML;
  renderedPage.css = css;
  renderedPage.js = js;

  return renderedPage;
}
