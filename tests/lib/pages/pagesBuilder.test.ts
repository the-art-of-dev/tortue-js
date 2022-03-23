import { PageBuilder } from "@lib/pages";
import path from "path";

describe("Page builder", () => {
  it("Build all", async () => {
    const builder = new PageBuilder(path.resolve("testData", "pages"));
    const pages = await builder.buildPages();

    expect(pages.map((p) => p.name)).toEqual([
      "Home",
      "Services-FirstService",
      "Services-SecondService",
    ]);
  });
});
