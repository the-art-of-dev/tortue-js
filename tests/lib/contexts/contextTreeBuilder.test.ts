import { ContextTreeBuilder } from "@lib/contexts";

describe("Context Tree Builder", () => {
    it("Build", async () => {
        const builder = new ContextTreeBuilder("./testData/components");
        const tree = await builder.build();
        expect(tree.findLeafNodes().map((n) => n.id)).toEqual([
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
    });
});
