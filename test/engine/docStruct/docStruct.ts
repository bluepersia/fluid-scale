import { PropertyData } from "../../../src/fluidData";
import { FluidProperty, Global } from "../../../src/index.types";

class DocStruct {
  struct: Record<string, FluidProperty[]> = {};
  #global: Global;

  constructor(global: Global) {
    this.#global = global;
  }

  addFluidProperty<T extends PropertyData>(
    goldenId: string,
    ctor: new (global: Global) => T
  ) {
    if (!this.struct[goldenId]) {
      this.struct[goldenId] = [];
    }
    const newFluidProperty: FluidProperty = {
      property: "",
      data: new ctor(this.#global),
    };
    this.struct[goldenId].push(newFluidProperty);
    return newFluidProperty;
  }
}

export { DocStruct };
