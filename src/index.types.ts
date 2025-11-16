type Global = UserSettings & Features;

type UserSettings = {
  autoForce: boolean;
};

type Features = {};

const STYLE_RULE_TYPE = 1;
const MEDIA_RULE_TYPE = 4;

type FluidPropMetaData = {
  property: string;
  orderID: number;
};

type FluidRange = {
  minBp: number;
  maxBp: number;
  minValue: FluidValue;
  maxValue: FluidValue;
};

type FluidValue = {
  type: "single";
};
type FluidSingleValue = {
  type: "single";
  value: number;
  unit: string;
};

export { STYLE_RULE_TYPE, MEDIA_RULE_TYPE };
export type {
  Global,
  UserSettings,
  Features,
  FluidPropMetaData,
  FluidRange,
  FluidValue,
  FluidSingleValue,
};
