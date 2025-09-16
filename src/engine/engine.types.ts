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
  boundClientRects: Map<HTMLElement, DOMRect>;
  computedStyles: Map<HTMLElement, CSSStyleDeclaration>;
  elementStates: Map<HTMLElement, ElementState>;
};

type IFluidProperty = {
  metaData: FluidPropertyMetaData;
  fluidRanges: (FluidRange | null)[];
  update(
    params: FluidPropertyUpdateParams
  ): FluidPropertyStateUpdate | undefined;
  percentTarget?: ElementWithState;
  percentTargetForFluidRange: boolean[];
  destroy(): void;
};

type FluidPropertyConfig = {
  el: HTMLElement;
  metaData: FluidPropertyMetaData;
  fluidRanges: (FluidRange | null)[];
  elStateCache: Map<HTMLElement, ElementState>;
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

type ElementState = {
  fluidProperties?: IFluidProperty[];
  isVisible?: boolean;
  updateWidth?: number;
  percentChangeFlag?: boolean;
  fluidStates: Map<string, AppliedFluidPropertyState>;
};

type ElementWithState = {
  el: HTMLElement;
  state: ElementState;
};

type ProcessAnchorMatchParams = {
  el: HTMLElement;
  anchor: string;
  breakpoints: number[];
  fluidData: FluidData;
};

type UpdateElementParams = {
  elBundle: ElementBundle;
  windowWidth: number;
  breakpoints: number[];
  currentBreakpointIndex: number;
};

type FluidPropertyUpdateParams = Pick<
  UpdateElementParams,
  "elBundle" | "windowWidth" | "breakpoints" | "currentBreakpointIndex"
> & {
  appliedState: AppliedFluidPropertyState | undefined;
};

type ComputeValueAsStringParams = Pick<
  FluidPropertyUpdateParams,
  "elBundle" | "windowWidth" | "breakpoints" | "currentBreakpointIndex"
> & {
  fluidRanges: (FluidRange | null)[];
  property: string;
};

type ComputationParams = {
  minValue: FluidValueBase[][];
  maxValue: FluidValueBase[][];
  progress: number;
  elBundle: ElementBundle;
  property: string;
  locks?: Locks;
  fluidRangeIndex: number;
};

type ValueComputationParams = Pick<
  ComputationParams,
  "elBundle" | "property"
> & {
  value: number | string;
  unit?: string;
};

type ConvertToPxParams = Omit<ValueComputationParams, "value"> & {
  value: number;
};

type RepeatLastComputedValueParams = {
  appliedOrder: number | undefined;
  appliedFluidRangedHasPercent: boolean;
  percentTargetState: ElementState | undefined;
  elUpdateWidth: number | undefined;
  order: number;
  windowWidth: number;
};

type ElementBundle = {
  el: ElementWithState;
  parent: ElementWithState;
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
  ElementState,
  ElementWithState,
  ProcessAnchorMatchParams,
  FluidPropertyConfig,
  ElementBundle,
  ComputeValueAsStringParams,
  FluidPropertyUpdateParams,
  UpdateElementParams,
};
