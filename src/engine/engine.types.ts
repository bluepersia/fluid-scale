import {
  FluidData,
  FluidPropertyMetaData,
  FluidRange,
  FluidValueBase,
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
  minValue: FluidValueBase[][];
  maxValue: FluidValueBase[][];
  progress: number;
  el: HTMLElement;
  property: string;
};

type ValueComputationParams = Pick<ComputationParams, "el" | "property"> & {
  value: number | string;
  unit?: string;
};

type ConvertToPxParams = Omit<ValueComputationParams, "value"> & {
  value: number;
};
export {
  GlobalState,
  IFluidProperty,
  AppliedFluidPropertyState,
  ValueComputationParams,
  ComputationParams,
  FluidPropertyStateUpdate,
  ConvertToPxParams,
};
