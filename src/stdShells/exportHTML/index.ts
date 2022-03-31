import { TortueShell } from "@lib/tortueShells";
import fs from "fs-extra";
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

      if (fs.existsSync(exportDirPath)) {
        await fs.remove(exportDirPath);
      }

      await fs.mkdir(exportDirPath, {
        recursive: true,
      });

      for (const page of data.pages) {
        const name = await page.name.toLowerCase();

        await fs.writeFile(
          path.resolve(exportDirPath, `${name}.html`),
          page.html,
        );
      }

      return data;
    },
  },
};

export default exportHTML;
