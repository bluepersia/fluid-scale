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
};

type IFluidProperty = {
  el: HTMLElement;
  metaData: FluidPropertyMetaData;
  fluidRanges: FluidRange[];
};

declare global {
  interface HTMLElement {
    fluidProperties: IFluidProperty[];
  }
}

export { GlobalState, IFluidProperty };
