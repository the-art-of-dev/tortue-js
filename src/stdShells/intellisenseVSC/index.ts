import { TortueShell } from "@lib/tortueShells";
import fsSync from "fs";
import { promisify } from "util";
const fs = {
  readFile: promisify(fsSync.readFile),
  writeFile: promisify(fsSync.writeFile),
  mkdir: promisify(fsSync.mkdir),
  readdir: promisify(fsSync.readdir),
};

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
