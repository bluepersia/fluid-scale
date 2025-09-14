import {
  FluidData,
  FluidPropertyMetaData,
  FluidRange,
  FluidValue,
} from "../parse/index.types";

type GlobalState = {
  breakpoints: number[];
  fluidData: FluidData;
  allElements: Set<HTMLElement>;
  activeElements: Set<HTMLElement>;
  pendingHiddenElements: Set<HTMLElement>;
  windowSize: [number, number];
  currentBreakpointIndex: number;
};

type IFluidProperty = {
  el: HTMLElement;
  metaData: FluidPropertyMetaData;
  fluidRanges: (FluidRange | null)[];
  state: FluidPropertyState;
};

type FluidPropertyState = {
  order: number;
  value: string;
  property: string;
  fluidProperty?: IFluidProperty;
  applied?: AppliedFluidPropertyState;
};

type AppliedFluidPropertyState = {
  value: string;
  order: number;
  windowWidth: number;
  fluidProperty: IFluidProperty;
};

declare global {
  interface HTMLElement {
    fluidProperties: IFluidProperty[];
    fluidPropertyStates: {
      [property: string]: FluidPropertyState;
    };
  }
}

type ComputationParams = {
  minValue: FluidValue;
  maxValue: FluidValue;
  progress: number;
  el: HTMLElement;
  property: string;
};

type ConvertToPxParams = Pick<ComputationParams, "el" | "property"> & {
  value: number;
  unit: string;
};

export {
  GlobalState,
  IFluidProperty,
  FluidPropertyState,
  AppliedFluidPropertyState,
  ConvertToPxParams,
  ComputationParams,
};
