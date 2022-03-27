import { TortuePipelineEvent, TortueShellConfig } from "@lib/tortue";
import { config } from "process";
import {
  TortueShell,
  TortueShellAction,
  TortueShellActionData,
} from "./tortueShell";

async function loadTortueShell(
  config: TortueShellConfig,
): Promise<TortueShell> {
  const shell: TortueShell = {
    name: config.name,
    actions: {},
  };

  try {
    const actions: {
      [key in TortuePipelineEvent]?: TortueShellAction<TortueShellActionData>;
    } = require(config.path ?? config.name);

    shell.actions = actions;
  } catch (error) {
    return null;
  }

  if (config.events) {
    for (const event of Object.keys(shell.actions)) {
      if (config.events.includes(event as TortuePipelineEvent)) continue;
      shell.actions[event] = null;
    }
  }

  return Promise.resolve(shell);
}

export async function buildTortueShells(
  configs: TortueShellConfig[],
): Promise<TortueShell[]> {
  const shells = [];
  for (const shellConfig of configs) {
    shells.push(await loadTortueShell(shellConfig));
  }
  return shells;
}
