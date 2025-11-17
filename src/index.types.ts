import type { FluidData, PropertyData } from "./fluidData";

type Global = UserSettings & Features;

type UserSettings = {
  autoForce: boolean;
  seekAlg: "stopAt1stNonMedia" | "stopAfterMedia" | "fullDoc";
};

type Features = {};

type GlobalState = {
  allEls: Map<HTMLElement, ElementState>;
  fluidData: FluidData;
  breakpoints: number[];
};

type ElementState = {
  el: HTMLElement;
  fluidProperties: FluidProperty[];
};

const STYLE_RULE_TYPE = 1;
const MEDIA_RULE_TYPE = 4;

type FluidPropMetaData = {
  property: string;
  orderID: number;
};

type FluidRange = {
  minBp: number;
  maxBp: number;
  minValue: FluidValue[][];
  maxValue: FluidValue[][];
};

type FluidValue = {
  type: "single";
};
type FluidValueSingle = {
  type: "single";
  value: number;
  unit: string;
};

type FluidProperty = {
  property: string;
  data: PropertyData;
};

export { STYLE_RULE_TYPE, MEDIA_RULE_TYPE };
export type {
  Global,
  UserSettings,
  Features,
  FluidPropMetaData,
  FluidRange,
  FluidValue,
  FluidValueSingle,
  GlobalState,
  ElementState,
  FluidProperty,
};
