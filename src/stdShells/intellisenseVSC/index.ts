import {
  Component,
  ComponentRegistry,
  MapComponentRegistry,
} from "@lib/components";
import { TortueShell } from "@lib/tortueShells";
import fs from "fs-extra";
import path from "path";

let oldRegistry: ComponentRegistry = null;
const CUSTOM_DATA_ROOT: string = `.vscode${path.sep}custom-data`;

function getCustomDataName(comp: Component) {
  const customDataName = `${comp.name.toLowerCase()}-custom-data.json`;
  return customDataName;
}

function getCustomDataPath(comp: Component) {
  return `${CUSTOM_DATA_ROOT}${path.sep}${getCustomDataName(comp)}`;
}

async function createComponentCustomData(comp: Component): Promise<void> {
  const htmlCstomData = {
    version: 1.1,
    tags: [
      {
        name: comp.name,
        description: comp.doc,
      },
    ],
  };

  await fs.writeJson(path.resolve(getCustomDataPath(comp)), htmlCstomData);
}

const intellisenseVSC: TortueShell = {
  name: "intellisense-vsc",
  actions: {
    componentsBuilt: async (data) => {
      if (!fs.existsSync(path.resolve(CUSTOM_DATA_ROOT))) {
        await fs.mkdirp(path.resolve(CUSTOM_DATA_ROOT));
      }

      const customDataPaths: string[] = [];

      for (const comp of data.registry.getAllComponents()) {
        let update = true;

        if (oldRegistry) {
          const oldComp = oldRegistry.getComponent(comp.name);
          update = oldComp && oldComp.doc != comp.doc;
        }

        if (update) {
          await createComponentCustomData(comp);
        }

        customDataPaths.push(getCustomDataPath(comp));
      }

      const vscSettingsNew = {
        ["html.customData"]: customDataPaths.sort(() => Math.random() - 0.5),
      };

      const vscSettingsPath = path.resolve(".vscode", "settings.json");
      let vscSettings = {};
      if (fs.existsSync(vscSettingsPath)) {
        vscSettings = await fs.readJson(vscSettingsPath);
      }

      if (!fs.existsSync(path.resolve(".vscode"))) {
        await fs.mkdirp(path.resolve(".vscode"));
      }

      await fs.writeJSON(
        vscSettingsPath,
        {
          ...vscSettings,
          ...vscSettingsNew,
        },
        {
          spaces: 2,
        },
      );

      oldRegistry = new MapComponentRegistry(data.registry.getAllComponents());

      return data;
    },
  },
};

export default intellisenseVSC;
