import { ComponentRegistry } from "../components";

export interface TortueShell {
  name: string;
  afterCompile(registry: ComponentRegistry): Promise<ComponentRegistry>;
}
