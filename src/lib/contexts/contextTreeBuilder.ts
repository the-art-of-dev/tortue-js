import path from "path";
import { ContextTree } from ".";
import { Context } from ".";
import fsSync from "fs";
import fs from "fs/promises";

//Helper functions
const dirContextFilter = (c: Context) =>
  !c.name.endsWith("-.") &&
  !c.name.endsWith("-..") &&
  fsSync.statSync(c.path).isDirectory();

const mapDirToContext = (parent: Context, d: string) => {
  return {
    name: parent.name ? `${parent.name}-${d}` : d,
    path: path.resolve(parent.path, d),
  } as Context;
};

const readContextDirs = async (c: Context) => fs.readdir(path.resolve(c.path));

//Default Builder implementation
export class ContextTreeBuilder {
  private rootContext: Context;

  constructor(contextsRoot: string) {
    this.rootContext = {
      name: "",
      path: path.resolve(contextsRoot),
    };
  }

  public async build(): Promise<ContextTree> {
    const tree = new ContextTree(this.rootContext);
    const stack = [this.rootContext];

    while (stack.length) {
      const current = stack.pop();
      tree.add(current);

      const children = await this.scanForChildDirContexts(current);
      if (children) {
        stack.push(...children.slice().reverse());
      }
    }
    return tree;
  }

  private async scanForChildDirContexts(
    currContext: Context,
  ): Promise<Context[]> {
    return (await readContextDirs(currContext))
      .map((d) => mapDirToContext(currContext, d))
      .filter((c) => dirContextFilter(c));
  }
}
