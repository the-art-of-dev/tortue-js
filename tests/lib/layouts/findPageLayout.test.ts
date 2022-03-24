import { findPageLayout } from "@lib/layouts/layout";
import { LayoutBuilder } from "@lib/layouts/layoutBuilder";
import path from "path";

describe("Find page layout", () => {
  it("Test", async () => {
    const builder = new LayoutBuilder(path.resolve("testData", "layouts"));
    const layouts = await builder.buildAll();
    expect(findPageLayout("Home-Section", layouts)).toEqual(layouts[0]);
    expect(findPageLayout("Blogs", layouts)).toEqual(layouts[1]);
  });
});
