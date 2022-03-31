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
        const name = page.name.toLowerCase();

        if (page.css) {
          await fs.writeFile(
            path.resolve(exportDirPath, "css", `${name}.css`),
            page.css,
          );

          const styleLink = dom.window.document.createElement("link");
          styleLink.rel = "stylesheet";
          styleLink.type = "text/css";
          styleLink.href = `/assets/css/${name}.css`;
          dom.window.document.head.appendChild(styleLink);
        }

        if (page.js) {
          await fs.writeFile(
            path.resolve(exportDirPath, "js", `${name}.js`),
            page.js,
          );

          const scriptTag = dom.window.document.createElement("script");
          scriptTag.type = "text/javascript";
          scriptTag.src = `/assets/js/${name}.js`;
          dom.window.document.body.appendChild(scriptTag);
        }

        page.html = dom.window.document.documentElement.outerHTML;
      }

      return data;
    },
  },
};

export default exportAssets;
