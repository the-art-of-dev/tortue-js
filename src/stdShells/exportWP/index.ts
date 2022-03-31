import { Page } from "@lib/pages";
import { TortueShell } from "@lib/tortueShells";
import chalk from "chalk";
import { exportWPPage } from "./utils";
import path from "path";
import fs from "fs-extra";

const log = console.log;
const logErr = (...text: any[]) => {
  log(chalk.red("[!]", ...text));
};
const logInfo = (...text: any[]) => {
  log(chalk.white("[*]", ...text));
};

interface ExportWPArgs {
  outputDir: string;
}

const exportWPShell: TortueShell = {
  name: "export-wp",
  actions: {
    renderFinished: async (data) => {
      const config = data.config.shellsConfig.find(
        (s) => s.name == "export-wp",
      );

      const args = (config?.args as ExportWPArgs) ?? {
        outputDir: "dist-wp",
      };

      const outputPath = path.resolve(args.outputDir);

      if (fs.existsSync(outputPath)) {
        await fs.remove(outputPath);
      }

      await fs.mkdirp(outputPath);

      for (const page of data.pages) {
        await exportWPPage(page, outputPath);
      }

      return data;
    },
  },
};

export default exportWPShell;
