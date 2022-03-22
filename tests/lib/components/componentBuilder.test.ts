import { ComponentBuilder } from "@lib/components";
import { Context } from "@lib/contexts";
import path from "path";

describe("Component Builder", () => {
  it("Build All/Contexts", async () => {
    const builder = new ComponentBuilder(
      path.resolve("testData", "components"),
    );

    const contexts = await builder.getComponentsContexts();
    expect(contexts.map((c) => c.name)).toEqual([
      "Common-Footer",
      "Common-Header",
      "Home-Section",
      "Home-Slider",
    ]);

    const registry = await builder.buildAllComponents();
    expect(registry.getAllComponents().map((c) => c.name)).toEqual([
      "Common-Header",
      "Home-Section",
      "Home-Slider",
    ]);
  });
});
