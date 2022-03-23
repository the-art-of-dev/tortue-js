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
        this.componentsMap.set(comp.name.toUpperCase(), comp);
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
    if (!this.componentsMap.has(compName.toUpperCase())) return null;
    return this.componentsMap.get(compName.toUpperCase());
  }

  addComponent(comp: Component): void {
    this.componentsMap.set(comp.name.toUpperCase(), comp);
  }
  removeComponent(compName: string): Component {
    const comp = this.getComponent(compName.toUpperCase());
    if (comp) {
      this.componentsMap.delete(compName.toUpperCase());
    }
    return comp;
  }

  toJSON() {
    return this.getAllComponents();
  }
}
