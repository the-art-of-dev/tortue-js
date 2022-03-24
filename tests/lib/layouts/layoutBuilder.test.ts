import { LayoutBuilder } from "@lib/layouts/layoutBuilder";
import path from "path";

describe("Layout Builder", () => {
  it("Build All", async () => {
    const builder = new LayoutBuilder(path.resolve("testData", "layouts"));
    const layouts = await builder.buildAll();
    expect(layouts.map((l) => l.name)).toEqual(["Home", ""]);
    expect(layouts[0].html).toEqual("{{content}}");
  });
});
