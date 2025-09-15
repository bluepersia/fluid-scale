type FluidRange = {
  minValue: FluidValueBase[][];
  maxValue: FluidValueBase[][];
  minIndex: number;
  maxIndex: number;
  locks?: Locks;
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

type Locks = Set<string> | "all" | null;

export {
  FluidRange,
  FluidValue,
  FluidData,
  FluidPropertyMetaData,
  FluidFunctionValue,
  FluidValueBase,
  FunctionType,
  ArithemticOperator,
  Locks,
};
