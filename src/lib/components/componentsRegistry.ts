import { Component } from ".";

export interface ComponentRegistry {
  addComponent(comp: Component): void;
  removeComponent(compName: string): Component;
  getComponent(compName: string): Component;
  getAllComponents(): Component[];
}

export class MapComponentRegistry implements ComponentRegistry {
  private componentsMap: Map<string, Component>;

  constructor(components?: Component[]) {
    this.componentsMap = new Map();
    if (components) {
      for (const comp of components) {
        this.componentsMap.set(comp.name, comp);
      }
    }
  }
  getAllComponents(): Component[] {
    const componenets: Component[] = [];
    this.componentsMap.forEach((v) => {
      componenets.push(v);
    });
    return componenets;
  }
  getComponent(compName: string): Component {
    if (!this.componentsMap.has(compName)) return null;
    return this.componentsMap.get(compName);
  }

  addComponent(comp: Component): void {
    this.componentsMap.set(comp.name, comp);
  }
  removeComponent(compName: string): Component {
    const comp = this.getComponent(compName);
    if (comp) {
      this.componentsMap.delete(compName);
    }
    return comp;
  }

  toJSON() {
    return JSON.stringify(this.componentsMap.values);
  }
}
