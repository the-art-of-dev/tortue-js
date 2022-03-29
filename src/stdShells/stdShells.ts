import exportHTMLShell from "@stdShells/exportHTML";
import exportAssets from "@stdShells/exportAssets";
import intellisenseVSC from "@stdShells/intellisenseVSC";
import { TortueShell } from "@lib/tortueShells";

export const stdShells: TortueShell[] = [];
stdShells.push(exportHTMLShell);
stdShells.push(exportAssets);
stdShells.push(intellisenseVSC);