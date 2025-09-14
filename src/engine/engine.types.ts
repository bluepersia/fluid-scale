import {
  FluidData,
  FluidPropertyMetaData,
  FluidRange,
} from "../parse/index.types";

type GlobalState = {
  breakpoints: number[];
  fluidData: FluidData;
  allElements: Set<HTMLElement>;
  activeElements: Set<HTMLElement>;
  pendingHiddenElements: Set<HTMLElement>;
  windowWidth: number;
};

type IFluidProperty = {
  el: HTMLElement;
  metaData: FluidPropertyMetaData;
  fluidRanges: FluidRange[];
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

export {
  GlobalState,
  IFluidProperty,
  FluidPropertyState,
  AppliedFluidPropertyState,
};
