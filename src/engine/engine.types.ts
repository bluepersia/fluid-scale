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
  appliedStates: Map<[HTMLElement, string], AppliedFluidPropertyState>;
};

type IFluidProperty = {
  el: HTMLElement;
  metaData: FluidPropertyMetaData;
  fluidRanges: (FluidRange | null)[];
  update(
    appliedState: AppliedFluidPropertyState | undefined
  ): FluidPropertyStateUpdate | undefined;
};

type FluidPropertyStateUpdate = {
  order: number;
  value: string;
  fluidProperty: IFluidProperty;
};

type AppliedFluidPropertyState = {
  value: string;
  order: number;
  fluidProperty: IFluidProperty;
};

declare global {
  interface HTMLElement {
    fluidProperties?: IFluidProperty[];
    isVisible?: boolean;
    updateWidth?: number;
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
  AppliedFluidPropertyState,
  ConvertToPxParams,
  ComputationParams,
  FluidPropertyStateUpdate,
};
