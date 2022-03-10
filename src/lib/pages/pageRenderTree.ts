import { Tree, TreeNode } from "../helpers";

export interface RenderData {
  pageName: string;
  componentName: string;
}

export class PageRenderTree implements Tree<RenderData> {
  root: TreeNode<RenderData>;

  constructor(root: RenderData) {
    this.root = {
      id: "",
      children: [],
      data: { ...root },
    };
  }

  find(id: string): TreeNode<RenderData> {
    let node = null;
    this.traverseSync(this.root, (n) => {
      if (n.id == id) node = n;
    });
    return node;
  }
  add(data: RenderData): TreeNode<RenderData> {
    throw new Error("Method not implemented.");
  }
  remove(id: string): TreeNode<RenderData> {
    throw new Error("Method not implemented.");
  }
  findLeafNodes(): TreeNode<RenderData>[] {
    throw new Error("Method not implemented.");
  }
  traverseSync(
    start: TreeNode<RenderData>,
    callback: (n: TreeNode<RenderData>) => void,
  ): void {
    const stack = [start];
    const visited = new Map<string, boolean>();

    while (stack.length) {
      const current = stack.pop();

      if (current.children && visited.has(current.id)) {
        stack.push(current, ...current.children);
        visited.set(current.id, true);
        continue;
      }

      callback(current);
    }
  }
  traverse(
    start: string,
    callback: (n: TreeNode<RenderData>) => Promise<void>,
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
