import {
  FluidData,
  FluidPropertyMetaData,
  FluidRange,
  FluidValueBase,
  Locks,
} from "../parse/index.types";

type GlobalState = {
  breakpoints: number[];
  fluidData: FluidData;
  allElements: Set<HTMLElement>;
  activeElements: HTMLElement[];
  pendingHiddenElements: Set<HTMLElement>;
  windowSize: [number, number];
  currentBreakpointIndex: number;
  appliedStates: Map<[HTMLElement, string], AppliedFluidPropertyState>;
  boundClientRects: Map<HTMLElement, DOMRect>;
  computedStyles: Map<HTMLElement, CSSStyleDeclaration>;
};

type IFluidProperty = {
  el: HTMLElement;
  metaData: FluidPropertyMetaData;
  fluidRanges: (FluidRange | null)[];
  update(
    appliedState: AppliedFluidPropertyState | undefined
  ): FluidPropertyStateUpdate | undefined;
  percentTarget?: HTMLElement;
  percentTargetForFluidRange: boolean[];
  destroy(): void;
};

type FluidPropertyStateUpdate = {
  order: number;
  value: string;
  fluidProperty: IFluidProperty;
  fluidRangeIndex: number;
};

type AppliedFluidPropertyState = {
  value: string;
  order: number;
  fluidProperty: IFluidProperty;
  fluidRangeIndex: number;
};

declare global {
  interface HTMLElement {
    fluidProperties?: IFluidProperty[];
    isVisible?: boolean;
    updateWidth?: number;
    percentChangeFlag?: boolean;
  }
}

type ComputationParams = {
  minValue: FluidValueBase[][];
  maxValue: FluidValueBase[][];
  progress: number;
  el: HTMLElement;
  property: string;
  locks?: Locks;
  fluidRangeIndex: number;
};

type ValueComputationParams = Pick<ComputationParams, "el" | "property"> & {
  value: number | string;
  unit?: string;
};

type ConvertToPxParams = Omit<ValueComputationParams, "value"> & {
  value: number;
};

type RepeatLastComputedValueParams = {
  appliedOrder: number | undefined;
  appliedFluidRangedHasPercent: boolean;
  percentTarget: HTMLElement | undefined;
  elUpdateWidth: number | undefined;
  order: number;
};
export {
  GlobalState,
  IFluidProperty,
  AppliedFluidPropertyState,
  ValueComputationParams,
  ComputationParams,
  FluidPropertyStateUpdate,
  ConvertToPxParams,
  RepeatLastComputedValueParams,
};
