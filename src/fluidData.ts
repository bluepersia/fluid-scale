import type { FluidPropMetaData, FluidRange, Global } from "./index.types";

type AddSimpleRangedPropParams = {
  anchor: string;
  selector: string;
  property: string;
  minBp: number;
  maxBp: number;
  minValue: {
    value: number;
    unit: string;
  };
  maxValue: {
    value: number;
    unit: string;
  };
};

type AddAutoForcedPropParams = {
  anchor: string;
  selector: string;
  property: string;
  value: string;
};

class FluidData {
  anchors: Record<string, AnchorData> = {};
  #global: Global;

  constructor(global: Global) {
    this.#global = global;
  }

  addAnchor(key: string) {
    if (this.anchors[key]) {
      return this.anchors[key];
    }
    this.anchors[key] = new AnchorData(this.#global);
    return this.anchors[key];
  }

  addSimpleRangedProp(params: AddSimpleRangedPropParams) {
    const { anchor, selector, property, minBp, maxBp, minValue, maxValue } =
      params;
    const anchorData = this.addAnchor(anchor);
    const selectorData = anchorData.addSelector(selector);
    const propertyData = selectorData.addRangedProperty(property);
    propertyData.ranges.push({
      minBp,
      maxBp,
      minValue: [
        [
          {
            type: "single",
            ...minValue,
          },
        ],
      ],
      maxValue: [
        [
          {
            type: "single",
            ...maxValue,
          },
        ],
      ],
    });
    return propertyData;
  }

  addAutoForcedProp(params: AddAutoForcedPropParams) {
    if (!this.#global.autoForce) {
      return;
    }
    const { anchor, selector, property, value } = params;
    const anchorData = this.addAnchor(anchor);
    const selectorData = anchorData.addSelector(selector);
    const propertyData = selectorData.addAutoForcedProperty(property);
    propertyData.value = value;
    return propertyData;
  }
}

class AnchorData {
  selectors: Record<string, SelectorData> = {};
  #global: Global;
  constructor(global: Global) {
    this.#global = global;
  }
  addSelector(key: string) {
    if (this.selectors[key]) {
      return this.selectors[key];
    }
    this.selectors[key] = new SelectorData(this.#global);
    return this.selectors[key];
  }
}

class SelectorData {
  properties: Record<string, PropertyData> = {};
  #global: Global;
  constructor(global: Global) {
    this.#global = global;
  }
  addRangedProperty(key: string): RangedPropertyData {
    if (this.properties[key]) {
      const result = this.properties[key];
      if (result instanceof RangedPropertyData) {
        return result;
      }
      throw new Error("Property already exists but is not a ranged property");
    }
    const result = (this.properties[key] = new RangedPropertyData(
      this.#global
    ));
    this.properties[key] = result;
    return result;
  }
  addAutoForcedProperty(key: string): AutoForcedPropertyData {
    if (this.properties[key]) {
      const result = this.properties[key];
      if (result instanceof AutoForcedPropertyData) {
        return result;
      }
      throw new Error(
        `Property ${key} already exists but is not an auto forced property`
      );
    }
    const result = (this.properties[key] = new AutoForcedPropertyData(
      this.#global
    ));
    return result;
  }
}

abstract class PropertyData {
  metaData: Omit<FluidPropMetaData, "property"> = { orderID: 0 };
  // @ts-ignore
  #global: Global;
  constructor(global: Global) {
    this.#global = global;
  }
}

class RangedPropertyData extends PropertyData {
  ranges: FluidRange[] = [];
}

class AutoForcedPropertyData extends PropertyData {
  value: string = "";
}

export { FluidData };
