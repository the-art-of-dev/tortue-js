import { ComponentBuilder } from "@lib/components";
import path from "path";

describe("Component Builder", () => {
    it("Build All/Contexts", async () => {
        const builder = new ComponentBuilder(
            path.resolve("testData", "components"),
        );

        const contexts = await builder.getComponentsContexts();
        expect(contexts.map((c) => c.name)).toEqual([
            "Common-Footer",
            "Common-Global",
            "Common-Header",
            "Home-Hero-Back",
            "Home-Hero-Section",
            "Home-Hero-Tag",
            "Home-Section",
            "Home-Slider",
            "Home-Testera",
        ]);

        const registry = await builder.buildAllComponents();
        expect(registry.getAllComponents().map((c) => c.name)).toEqual([
            "Common-Global",
            "Common-Header",
            "Home-Section",
            "Home-Slider",
        ]);
    });
});
