import { FluidPropertyMetaData, FluidRange } from "../parse/index.types";
import { computeValue } from "./computation";
import { getState } from "./engine";
import {
  AppliedFluidPropertyState,
  ComputationParams,
  FluidPropertyStateUpdate,
  IFluidProperty,
} from "./engine.types";

class FluidProperty implements IFluidProperty {
  el: HTMLElement;
  metaData: FluidPropertyMetaData;
  fluidRanges: (FluidRange | null)[];

  constructor(
    el: HTMLElement,
    metaData: FluidPropertyMetaData,
    fluidRanges: (FluidRange | null)[]
  ) {
    this.el = el;
    this.metaData = metaData;
    this.fluidRanges = fluidRanges;
  }

  update(
    appliedState: AppliedFluidPropertyState | undefined
  ): FluidPropertyStateUpdate | undefined {
    if (
      appliedState &&
      repeatLastComputedValue(
        appliedState.order,
        this.metaData.order,
        this.el.updateWidth
      )
    ) {
      if (appliedState.fluidProperty === this) return appliedState;
      return;
    }

    const value = computeValueAsString(
      this.fluidRanges,
      this.el,
      this.metaData.property
    );

    return {
      order: this.metaData.order,
      value,
      fluidProperty: this,
    };
  }
}

function repeatLastComputedValue(
  appliedOrder: number | undefined,
  order: number,
  elUpdateWidth: number | undefined
): boolean {
  if (!appliedOrder) return false;

  if (order > appliedOrder) return false;

  if (!elUpdateWidth) return false;

  return Math.abs(elUpdateWidth - getState().windowSize[0]) < 1;
}

function computeValueAsString(
  fluidRanges: (FluidRange | null)[],
  el: HTMLElement,
  property: string
): string {
  const state = makeComputationParams(fluidRanges, el, property);

  if (!state) return "";

  const value = computeValue(state);

  return value
    .map((group) =>
      group
        .map((value) => (typeof value === "number" ? `${value}px` : value))
        .join(" ")
    )
    .join(",");
}

function makeComputationParams(
  fluidRanges: (FluidRange | null)[],
  el: HTMLElement,
  property: string
): ComputationParams | null {
  const {
    currentBreakpointIndex,
    windowSize: [windowWidth],
    breakpoints,
  } = getState();

  const currentFluidRange = fluidRanges.find(
    (range) =>
      range &&
      currentBreakpointIndex >= range.minIndex &&
      currentBreakpointIndex <= range.maxIndex
  );

  if (!currentFluidRange) return null;

  const minBreakpoint = breakpoints[currentFluidRange.minIndex];
  const maxBreakpoint = breakpoints[currentFluidRange.maxIndex];

  const progress =
    (windowWidth - minBreakpoint) / (maxBreakpoint - minBreakpoint);

  return { ...currentFluidRange, progress, el, property };
}

export {
  FluidProperty,
  computeValueAsString,
  repeatLastComputedValue,
  makeComputationParams,
};
