import { PropertyData } from "../../../src/fluidData";
import { FluidProperty, Global } from "../../../src/index.types";
import { SerializedElement } from "../index.types";

class DocStruct {
  struct: Record<string, FluidProperty[]> = {};
  #global: Global;

  constructor(global: Global) {
    this.#global = global;
  }

  get global() {
    return this.#global;
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

function writeSerializedElementsToDocStruct(
  docStruct: DocStruct,
  serializedElements: SerializedElement[]
) {
  for (const serializedElement of serializedElements) {
    const elData: FluidProperty[] = (docStruct.struct[
      serializedElement.goldenId
    ] = []);
    for (const fluidProperty of serializedElement.fluidProperties) {
      const newFluidProperty: FluidProperty = {
        property: fluidProperty.property,
        data: fluidProperty.data,
      };
      elData.push(newFluidProperty);
    }
  }
  return docStruct;
}

export { DocStruct, writeSerializedElementsToDocStruct };
