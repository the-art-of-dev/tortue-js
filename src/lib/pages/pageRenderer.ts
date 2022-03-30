import { JSDOM } from "jsdom";
import { Page } from "./page";
import {
  ComponentRegisterRendererJSDOM,
  ComponentRegistry,
} from "@lib/components";
import Mustache from "mustache";
import { Layout } from "@lib/layouts";

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
  const componentEl = crr.render(el);

  //attributtes
  const renderProps = crr.extractProps<any>(el);
  const defaultProps = crr.extractProps<any>(componentEl);

  if (el.innerHTML) renderProps["lbContent"] = el.innerHTML; //todo: deprecated
  if (el.innerHTML) renderProps["innerContent"] = el.innerHTML;
  for (const prop of Object.keys(defaultProps)) {
    if (!renderProps[prop]) {
      renderProps[prop] = defaultProps[prop];
    }
  }

  const renderedHTML = Mustache.render(comp.html, renderProps);
  const rendered = JSDOM.fragment(renderedHTML).firstChild;

  el.replaceWith(rendered);
  traverseElement(rendered as HTMLElement, (el) =>
    renderElement(el, registry, depList, crr),
  );
  depList.add(comp.name);
}

export function renderPage(
  page: Page,
  registry: ComponentRegistry,
  layout: Layout,
): Page {
  const crr = new ComponentRegisterRendererJSDOM(registry);
  const dom = new JSDOM(layout.html);
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
