import { ComponentBuilder } from "@lib/components";
import { PageBuilder, renderPage } from "@lib/pages";
import { JSDOM } from "jsdom";
import path from "path";

describe("Page Renderer", () => {
  it("Render Home", async () => {
    const builder = new PageBuilder(path.resolve("testData", "pages"));
    const pages = await builder.buildPages();

    const compBuilder = new ComponentBuilder(
      path.resolve("testData", "components"),
    );
    const compRegistry = await compBuilder.buildAllComponents();

    const homePage = pages.find((p) => p.name.toLowerCase() == "home");
    const page = renderPage(homePage, compRegistry);
  });
});
