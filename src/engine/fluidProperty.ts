import {
  ArithemticOperator,
  FluidFunctionValue,
  FluidPropertyMetaData,
  FluidRange,
  FluidValue,
  FluidValueBase,
} from "../parse/index.types";
import { computeValue } from "./computation";
import { getState } from "./instance/engine";
import {
  AppliedFluidPropertyState,
  ComputationParams,
  FluidPropertyStateUpdate,
  IFluidProperty,
  RepeatLastComputedValueParams,
} from "./engine.types";
import {
  observePercentTarget,
  unobservePercentTarget,
} from "./instance/observers";

class FluidProperty implements IFluidProperty {
  el: HTMLElement;
  metaData: FluidPropertyMetaData;
  fluidRanges: (FluidRange | null)[];
  percentTarget?: HTMLElement;
  percentTargetForFluidRange: boolean[];
  constructor(
    el: HTMLElement,
    metaData: FluidPropertyMetaData,
    fluidRanges: (FluidRange | null)[]
  ) {
    this.el = el;
    this.metaData = metaData;
    this.fluidRanges = fluidRanges;
    this.percentTargetForFluidRange = fluidRanges.map((fluidRange) => {
      return (
        fluidRange?.minValue.some((group) => group.some(hasPercent)) ||
        fluidRange?.maxValue.some((group) => group.some(hasPercent)) ||
        false
      );
    });

    this.setPercentTarget();

    if (
      this.percentTarget &&
      this.percentTargetForFluidRange.some((val) => val === true)
    )
      observePercentTarget(this.percentTarget);
  }

  setPercentTarget() {
    const el = this.el;
    const parent = el.parentElement || document.documentElement;
    switch (this.metaData.property) {
      case "width":
      case "left":
      case "right":
      case "margin-left":
      case "margin-right":
      case "padding-left":
      case "padding-right":
      case "border-left-width":
      case "border-right-width":
        this.percentTarget = parent;
        break;
      case "height":
      case "top":
      case "bottom":
      case "margin-top":
      case "margin-bottom":
      case "padding-top":
      case "padding-bottom":
      case "border-top-width":
      case "border-bottom-width":
        this.percentTarget = parent;
        break;
      case "background-position-x":
        this.percentTarget = el;
        break;
      case "background-position-y":
        this.percentTarget = el;
        break;
      case "font-size":
        this.percentTarget = parent;
        break;
      case "line-height":
        this.percentTarget = el;
        break;
    }
  }

  destroy() {
    if (this.percentTarget) unobservePercentTarget(this.percentTarget);
  }

  update(
    appliedState: AppliedFluidPropertyState | undefined
  ): FluidPropertyStateUpdate | undefined {
    if (
      appliedState &&
      repeatLastComputedValue(
        this.makeRepeatLastComputedValueParams(appliedState)
      )
    ) {
      if (appliedState.fluidProperty === this) return appliedState;
      return;
    }

    const { value, fluidRangeIndex } = computeValueAsString(
      this.fluidRanges,
      this.el,
      this.metaData.property
    );

    return {
      order: this.metaData.order,
      value,
      fluidProperty: this,
      fluidRangeIndex,
    };
  }

  makeRepeatLastComputedValueParams(appliedState: AppliedFluidPropertyState) {
    return {
      appliedOrder: appliedState.order,
      appliedFluidRangedHasPercent:
        this.percentTargetForFluidRange[appliedState?.fluidRangeIndex],
      percentTarget: this.percentTarget,
      order: this.metaData.order,
      elUpdateWidth: this.el.updateWidth,
    };
  }
}

function repeatLastComputedValue(
  params: RepeatLastComputedValueParams
): boolean {
  const {
    appliedOrder,
    order,
    elUpdateWidth,
    appliedFluidRangedHasPercent,
    percentTarget,
  } = params;

  if (!appliedOrder) return false;

  if (appliedFluidRangedHasPercent && percentTarget?.percentChangeFlag)
    return false;

  if (order > appliedOrder) return false;

  if (!elUpdateWidth) return false;

  return Math.abs(elUpdateWidth - getState().windowSize[0]) < 1;
}

function computeValueAsString(
  fluidRanges: (FluidRange | null)[],
  el: HTMLElement,
  property: string
): { value: string; fluidRangeIndex: number } {
  const state = makeComputationParams(fluidRanges, el, property);

  if (!state) return { value: "", fluidRangeIndex: -1 };

  const value = computeValue(state);

  return {
    value: value
      .map((group) =>
        group
          .map((value) => (typeof value === "number" ? `${value}px` : value))
          .join(" ")
      )
      .join(","),
    fluidRangeIndex: state.fluidRangeIndex,
  };
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

  const fluidRangeIndex = fluidRanges.findIndex(
    (range) =>
      range &&
      currentBreakpointIndex >= range.minIndex &&
      currentBreakpointIndex <= range.maxIndex
  );

  const currentFluidRange = fluidRanges[fluidRangeIndex];
  if (!currentFluidRange) return null;

  const minBreakpoint = breakpoints[currentFluidRange.minIndex];
  const maxBreakpoint = breakpoints[currentFluidRange.maxIndex];

  const progress =
    (windowWidth - minBreakpoint) / (maxBreakpoint - minBreakpoint);

  return { ...currentFluidRange, progress, el, property, fluidRangeIndex };
}

function hasPercent(
  fluidValueBase: FluidValueBase | ArithemticOperator
): boolean {
  const fluidFunc = fluidValueBase as FluidFunctionValue;

  if (fluidFunc.type) return fluidFunc.values.some(hasPercent);

  const fluidValue = fluidValueBase as FluidValue;

  if (fluidValue.unit) return fluidValue.unit === "%";

  return false;
}

export {
  FluidProperty,
  computeValueAsString,
  repeatLastComputedValue,
  makeComputationParams,
};
