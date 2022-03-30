import path from "path";
import { Page } from ".";
import { Context, ContextTree, ContextTreeBuilder } from "../contexts";
import fsSync from "fs";
import { promisify } from "util";
const fs = {
  readFile: promisify(fsSync.readFile),
  writeFile: promisify(fsSync.writeFile),
  mkdir: promisify(fsSync.mkdir),
  readdir: promisify(fsSync.readdir),
};

export class PageBuilder {
  private pagesRoot: string;

  constructor(pagesRoot: string) {
    this.pagesRoot = pagesRoot;
  }

  private async getPageContexts(): Promise<Context[]> {
    const treeBuilder = new ContextTreeBuilder(this.pagesRoot);
    const tree = await treeBuilder.build();

    const pageContexts: Context[] = tree.findLeafNodes().map((n) => n.data);

    return pageContexts;
  }

  private async buildPage(context: Context): Promise<Page> {
    const htmlPath = path.resolve(context.path, "index.html");
    const cssPath = path.resolve(context.path, "style.css");
    const jsPath = path.resolve(context.path, "script.js");

    const isHtml = fsSync.existsSync(htmlPath);
    const isCss = fsSync.existsSync(cssPath);
    const isJs = fsSync.existsSync(jsPath);

    if (!(isHtml || isCss || isJs)) return null;

    const page: Page = {
      name: context.name,
      html: isHtml ? (await fs.readFile(htmlPath)).toString() : null,
      css: isJs ? (await fs.readFile(cssPath)).toString() : null,
      js: isCss ? (await fs.readFile(jsPath)).toString() : null,
    };

    return Promise.resolve(page);
  }

  public async buildPages(): Promise<Page[]> {
    const pageContexts = await this.getPageContexts();
    const pages: Page[] = [];

    for (const context of pageContexts) {
      const page = await this.buildPage(context);
      if (page) pages.push(page);
    }

    return pages;
  }
}
