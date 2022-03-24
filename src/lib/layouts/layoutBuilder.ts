import { Context, ContextTreeBuilder } from "@lib/contexts";
import path from "path";
import { Layout } from "./layout";
import fsSync from "fs";
import fs from "fs/promises";

export class LayoutBuilder {
  private layoutsRoot: string;

  /**
   *
   */
  constructor(layoutsRoot: string) {
    this.layoutsRoot = layoutsRoot;
  }

  public async getLayoutContexts(): Promise<Context[]> {
    const treeBuilder = new ContextTreeBuilder(this.layoutsRoot);
    const tree = await treeBuilder.build();

    const layoutContexts: Context[] = [];

    tree.traverseSync(tree.root, (n) => {
      if (fsSync.existsSync(path.resolve(n.data.path, "layout.html"))) {
        layoutContexts.push(n.data);
      }
    });

    return layoutContexts;
  }

  public async build(context: Context): Promise<Layout> {
    const layoutPath = path.resolve(context.path, "layout.html");
    if (fsSync.existsSync(layoutPath)) {
      return {
        name: context.name,
        html: (await fs.readFile(layoutPath)).toString(),
      };
    }
    return null;
  }

  public async buildAll(): Promise<Layout[]> {
    const layoutContexts = await this.getLayoutContexts();
    const layouts: Layout[] = [];

    for (const context of layoutContexts) {
      const layout = await this.build(context);
      if (layout) layouts.push(layout);
    }

    return layouts;
  }
}
