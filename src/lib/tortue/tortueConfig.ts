import { TortuePipelineEvent } from "@lib/tortue";

export interface TortueShellConfig {
  name: string;
  path?: string;
  args?: any;
  events?: TortuePipelineEvent[];
}

export interface TortueConfig {
  componentsDir: string;
  pagesDir: string;
  layoutsDir: string;
  shellsConfig: TortueShellConfig[];
}

export const DEFAULT_TORTUE_CONFIG: TortueConfig = {
  componentsDir: "components",
  pagesDir: "pages",
  layoutsDir: "layouts",
  shellsConfig: null,
};
