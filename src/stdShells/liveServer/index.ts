import { TortueShell } from "@lib/tortueShells";
import fsSync from "fs";
import { promisify } from "util";
import liveServer from "live-server";
import chalk from "chalk";

const log = console.log;
const logErr = (...text: any[]) => {
  log(chalk.red("[!]", ...text));
};
const logInfo = (...text: any[]) => {
  log(chalk.white("[*]", ...text));
};

interface LiveServerArgs {
  port?: number;
  host?: string;
  root?: string;
  wait?: number;
  mount?: string[][];
}

let isRunning = false;

const liveServerShell: TortueShell = {
  name: "live-server",
  actions: {
    renderFinished: async (data) => {
      if (isRunning) return data;

      const config = data.config.shellsConfig.find(
        (s) => s.name == "export-html",
      );
      const args = config?.args as LiveServerArgs;

      const params: liveServer.LiveServerParams = {
        port: args?.port ?? 8081,
        host: args?.host ?? "0.0.0.0",
        root: args?.root ?? "dist-html",
        wait: args?.wait ?? 500,
        mount: args?.mount ?? [["/assets", "./assets"]],
        logLevel: 0,
      };

      liveServer.start(params);
      isRunning = true;
      logInfo("Started development server....");

      return data;
    },
  },
};

export default liveServerShell;
