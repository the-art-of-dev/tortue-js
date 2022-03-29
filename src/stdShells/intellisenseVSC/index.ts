import { TortueShell } from "@lib/tortueShells";
import fs from "fs/promises";

const intellisenseVSC: TortueShell = {
  name: "intellisense-vsc",
  actions: {
    componentsBuilt: async (data) => {
      const htmlCstomData = {
        version: 1.1,
        tags: [] as any[],
      };

      for (const comp of data.registry.getAllComponents()) {
        htmlCstomData.tags.push({
          name: comp.name,
          description: comp.doc,
        });
      }

      await fs.writeFile(
        "components-html-custom-data.json",
        JSON.stringify(htmlCstomData),
      );

      return data;
    },
  },
};

export default intellisenseVSC;
