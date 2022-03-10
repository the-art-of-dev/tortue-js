import { Tree } from ".";
import { TreeNode } from ".";

export interface TxtNode {
  name: string;
}

export class TxtTree<T extends TxtNode> implements Tree<T> {
  root: TreeNode<T>;

  /**
   *
   */
  constructor(c: T) {
    this.root = {
      id: c.name,
      data: c,
      children: [],
    };
  }
  public findLeafNodes() {
    const leafNodes: TreeNode<T>[] = [];

    this.traverseSync(this.root, (n) => {
      if (n.children) return;
      leafNodes.push(n);
    });

    return leafNodes;
  }

  public find(id: string): TreeNode<T> {
    let node = null;
    this.traverseSync(this.root, (n) => {
      if (n.id == id) node = n;
    });
    return node;
  }

  public remove(id: string): TreeNode<T> {
    const node = this.find(id);
    if (!node) return null;

    const parent = this.find(this.getParendId(node.id));
    parent.children = parent.children.filter((c) => c.id != node.id);
    return node;
  }

  private getParendId(id: string) {
    return id.split("-").splice(-1).join("-");
  }

  public add(c: T): TreeNode<T> {
    if (this.find(c.name)) return null;

    const parent = this.find(this.getParendId(c.name));
    if (!parent) return null;

    const newNode: TreeNode<T> = {
      id: c.name,
      data: c,
      children: [],
    };
    parent.children.push(newNode);
    return newNode;
  }

  public traverseSync(start: TreeNode<T>, callback: (n: TreeNode<T>) => void) {
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

  public async traverse(
    start: string,
    callback: (...props: any) => Promise<any>,
  ) {
    throw new Error("Not implemented!");
  }
}
