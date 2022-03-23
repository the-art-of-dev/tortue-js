import { Component, MapComponentRegistry } from "@lib/components";

describe("Component Registry tests", () => {
  it("Insert/Remove/JSON", () => {
    const components: Component[] = [
      {
        name: "Common-Header",
        html: "",
        dependecies: [],
      },
      {
        name: "Common-Footer",
        html: "",
        dependecies: [],
      },
      {
        name: "Home-Header",
        html: "",
        dependecies: [],
      },
    ];

    const registry = new MapComponentRegistry(components);
    expect(JSON.stringify(registry)).toEqual(JSON.stringify(components));
    expect(registry.getComponent("Common-Header")).toBe(components[0]);

    registry.removeComponent("Common-Header");
    expect(registry.getComponent("Common-Header")).toBe(null);
  });
});
