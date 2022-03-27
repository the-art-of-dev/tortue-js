import { Page } from "@lib/pages";
import { TortuePipelineEvent, TortueConfig } from "@lib/tortue";
import { ComponentRegistry } from "@lib/components";
import { Layout } from "@lib/layouts/layout";

export interface TortueShell {
  name: string;
  actions: {
    [key in TortuePipelineEvent]?: TortueShellAction<TortueShellActionData>;
  };
}

export interface TortueShellActionData {
  registry?: ComponentRegistry;
  pages?: Page[];
  layouts?: Layout[];
  config: TortueConfig;
}

export type TortueShellAction<T extends TortueShellActionData> = (
  data: T,
) => Promise<T>;
