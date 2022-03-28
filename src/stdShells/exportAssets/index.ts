import { TortueShell } from "@lib/tortueShells";
import fsSync from "fs";
import fs from "fs/promises";
import path from "path";
import { JSDOM } from "jsdom";

interface ExportAssetsArgs {
  exportDir: string;
}

const exportAssets: TortueShell = {
  name: "export-assets",
  actions: {
    renderFinished: async (data) => {
      const config = data.config.shellsConfig.find(
        (s) => s.name == "export-assets",
      );
      const args = config?.args as ExportAssetsArgs;
      const exportDir = args?.exportDir ?? "assets";
      const exportDirPath = path.resolve(exportDir);

      if (!fsSync.existsSync(exportDirPath)) {
        await fs.mkdir(exportDirPath, {
          recursive: true,
        });
      }

      await fs.mkdir(path.resolve(exportDirPath, "css"), {
        recursive: true,
      });

      await fs.mkdir(path.resolve(exportDirPath, "js"), {
        recursive: true,
      });

      for (const page of data.pages) {
        if (!page.css && !page.js) continue;
        const dom = new JSDOM(page.html);

        if (page.css) {
          await fs.writeFile(
            path.resolve(exportDirPath, "css", `${page.name}.css`),
            page.css,
          );

          const styleLink = dom.window.document.createElement("link");
          styleLink.rel = "stylesheet";
          styleLink.href = `/assets/css/${page.name}.css`;
          dom.window.document.head.appendChild(styleLink);
        }

        if (page.js) {
          await fs.writeFile(
            path.resolve(exportDirPath, "js", `${page.name}.js`),
            page.js,
          );

          const dom = new JSDOM(page.html);
          const scriptTag = dom.window.document.createElement("script");
          scriptTag.src = `/assets/js/${page.name}.js`;
          dom.window.document.body.appendChild(scriptTag);
        }

        page.html = dom.window.document.documentElement.outerHTML;
      }

      return data;
    },
  },
};

export default exportAssets;