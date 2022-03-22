import { ContextTree } from "@lib/contexts";

describe("Context Tree", () => {
  it("Insert", () => {
    const tree = new ContextTree({
      name: "",
      path: "",
    });

    const newContext = {
      name: "Common",
      path: "common",
    };
    const node = tree.add(newContext);

    expect(node?.data).toBe(newContext);
    expect(node?.data).toBe(tree.find(newContext.name).data);

    const childContext = {
      name: "Common-Test",
      path: "common-test",
    };

    const childNode = tree.add(childContext);
    expect(childNode?.data).toBe(childContext);
    expect(childNode?.data).toBe(tree.find(childContext.name).data);

    const childContextTwo = {
      name: "Common-Test2",
      path: "common-test2",
    };

    const childNodeTwo = tree.add(childContextTwo);
    expect(childNodeTwo?.data).toBe(childContextTwo);
    expect(childNodeTwo?.data).toBe(tree.find(childContextTwo.name).data);
    expect(tree.find(newContext.name).children.length).toBe(2);
  });

  it("Remove", () => {
    const tree = new ContextTree({
      name: "",
      path: "",
    });

    tree.add({
      name: "Common",
      path: "common",
    });

    tree.add({
      name: "Common-Test",
      path: "common-test",
    });

    tree.remove("Common-Test");
    expect(tree.find("Common-Test")).toBe(null);
    expect(tree.find("Common").children).toEqual([]);
  });

  it("Leaf Nodes", () => {
    const tree = new ContextTree({
      name: "",
      path: "",
    });

    tree.add({
      name: "Common",
      path: "common",
    });

    const l1 = tree.add({
      name: "Common-Test",
      path: "common-test",
    });

    const l2 = tree.add({
      name: "Common-Header",
      path: "common-header",
    });

    expect(tree.findLeafNodes()).toEqual([l1, l2]);
  });
});
