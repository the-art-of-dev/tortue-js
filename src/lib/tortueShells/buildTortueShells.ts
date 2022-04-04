import { TortuePipelineEvent, TortueShellConfig } from "@lib/tortue";
import fs from "fs-extra";
import {
  TortueShell,
  TortueShellAction,
  TortueShellActionData,
} from "./tortueShell";

import { stdShells } from "@stdShells/stdShells";
import path from "path";

async function loadTortueShell(
  config: TortueShellConfig,
): Promise<TortueShell> {
  const stdShell = stdShells.find((s) => s.name == config.name);
  if (stdShell) return stdShell;

  const shell: TortueShell = {
    name: config.name,
    actions: {},
  };

  if (config.path) config.path = path.resolve(config.path);

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
