import {
  ComponentBuilder,
  ComponentRegisterRendererJSDOM,
} from "@lib/components";
import { JSDOM } from "jsdom";
import path from "path";

describe("Component Registry Renderer", () => {
  it("Render component", async () => {
    const builder = new ComponentBuilder(
      path.resolve("testData", "components"),
    );
    const registry = await builder.buildAllComponents();
    const renderer = new ComponentRegisterRendererJSDOM(registry);
    const dom = JSDOM.fragment("<Common-Header></Common-Header>");

    expect(renderer.render(dom.firstChild as HTMLElement).innerHTML).toBe(
      "Hello",
    );

    expect(renderer.renderComponent("Home-Slider").innerHTML).toBe("Hello");
  });

  it("Find dependecies", async () => {
    const builder = new ComponentBuilder(
      path.resolve("testData", "components"),
    );
    const registry = await builder.buildAllComponents();
    const renderer = new ComponentRegisterRendererJSDOM(registry);

    expect(renderer.findComponentDependecies("Common-Header")).toEqual([]);
    expect(renderer.findComponentDependecies("Home-Section")).toEqual([
      "Common-Header",
      "Home-Slider",
    ]);
  });
});
