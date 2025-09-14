type FluidRange = {
  minValue: FluidValue;
  maxValue: FluidValue;
  minIndex: number;
  maxIndex: number;
};

type FluidValue = {
  value: number;
  unit: string;
};

type FluidData = {
  [anchor: string]: {
    [selector: string]: {
      [property: string]: {
        metaData: FluidPropertyMetaData;
        fluidRanges: FluidRange[];
      };
    };
  };
};

type FluidPropertyMetaData = {
  order: number;
  property: string;
};

export { FluidRange, FluidValue, FluidData, FluidPropertyMetaData };
