type FluidRange = {
  minValue: FluidValueBase[][];
  maxValue: FluidValueBase[][];
  minIndex: number;
  maxIndex: number;
};

type FluidValueBase = {};
type FluidValue = FluidValueBase & {
  value: number | string;
  unit?: string;
};

type FluidFunctionValue = FluidValueBase & {
  type: FunctionType;
  values: (FluidValueBase | ArithemticOperator)[];
};

type ArithemticOperator = "+" | "-" | "*" | "/";

type FunctionType = "calc" | "min" | "max" | "clamp" | "minmax";

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

export {
  FluidRange,
  FluidValue,
  FluidData,
  FluidPropertyMetaData,
  FluidFunctionValue,
  FluidValueBase,
  FunctionType,
  ArithemticOperator,
};
