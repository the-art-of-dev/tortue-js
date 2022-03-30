import { TortueShell } from "@lib/tortueShells";
import fsSync from "fs";
import { promisify } from "util";
const fs = {
  readFile: promisify(fsSync.readFile),
  writeFile: promisify(fsSync.writeFile),
  mkdir: promisify(fsSync.mkdir),
  readdir: promisify(fsSync.readdir),
};

import path from "path";

interface ExportHTMLArgs {
  exportDir: string;
}

const exportHTML: TortueShell = {
  name: "export-html",
  actions: {
    renderFinished: async (data) => {
      const config = data.config.shellsConfig.find(
        (s) => s.name == "export-html",
      );
      const args = config?.args as ExportHTMLArgs;
      const exportDir = args?.exportDir ?? "dist-html";
      const exportDirPath = path.resolve(exportDir);

      if (!fsSync.existsSync(exportDirPath)) {
        await fs.mkdir(exportDirPath, {
          recursive: true,
        });
      }

      for (const page of data.pages) {
        await fs.writeFile(
          path.resolve(exportDirPath, `${page.name}.html`),
          page.html,
        );
      }

      return data;
    },
  },
};

export default exportHTML;
