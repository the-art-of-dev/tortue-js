export interface TreeNode<T> {
  id: string;
  children: TreeNode<T>[];
  data: T;
}

export interface Tree<T> {
  root: TreeNode<T>;
  find(id: string): TreeNode<T>;
  add(data: T): TreeNode<T>;
  remove(id: string): TreeNode<T>;
  findLeafNodes(): TreeNode<T>[];
  traverseSync(start: TreeNode<T>, callback: (n: TreeNode<T>) => void): void;
  traverse(
    start: string,
    callback: (n: TreeNode<T>) => Promise<void>,
  ): Promise<void>;
}
