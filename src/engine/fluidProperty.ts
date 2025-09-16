import {
  ArithemticOperator,
  FluidFunctionValue,
  FluidPropertyMetaData,
  FluidRange,
  FluidValue,
  FluidValueBase,
} from "../parse/index.types";
import { computeValue } from "./computation";
import {
  AppliedFluidPropertyState,
  ComputationParams,
  ElementState,
  ElementWithState,
  FluidPropertyConfig,
  FluidPropertyStateUpdate,
  IFluidProperty,
  ComputeValueAsStringParams,
  RepeatLastComputedValueParams,
  FluidPropertyUpdateParams,
} from "./engine.types";
import {
  observePercentTarget,
  unobservePercentTarget,
} from "./instance/observers";

class FluidProperty implements IFluidProperty {
  metaData: FluidPropertyMetaData;
  fluidRanges: (FluidRange | null)[];
  percentTarget?: ElementWithState;
  percentTargetForFluidRange: boolean[];
  constructor(config: FluidPropertyConfig) {
    const { el, metaData, fluidRanges, elStateCache } = config;

    this.metaData = metaData;
    this.fluidRanges = fluidRanges;
    this.percentTargetForFluidRange = fluidRanges.map((fluidRange) => {
      return (
        fluidRange?.minValue.some((group) => group.some(hasPercent)) ||
        fluidRange?.maxValue.some((group) => group.some(hasPercent)) ||
        false
      );
    });

    this.setPercentTarget(el, elStateCache);

    if (
      this.percentTarget &&
      this.percentTargetForFluidRange.some((val) => val === true)
    )
      observePercentTarget(this.percentTarget.el);
  }

  setPercentTarget(
    el: HTMLElement,
    elStateCache: Map<HTMLElement, ElementState>
  ) {
    const parent = el.parentElement || document.documentElement;
    let targetEl;
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
        targetEl = parent;
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
        targetEl = parent;
        break;
      case "background-position-x":
        targetEl = el;
        break;
      case "background-position-y":
        targetEl = el;
        break;
      case "font-size":
        targetEl = parent;
        break;
      case "line-height":
        targetEl = el;
        break;
    }
    if (targetEl) {
      this.percentTarget = { el: targetEl, state: elStateCache.get(targetEl)! };
    }
  }

  destroy() {
    if (this.percentTarget) unobservePercentTarget(this.percentTarget.el);
  }

  update(
    params: FluidPropertyUpdateParams
  ): FluidPropertyStateUpdate | undefined {
    const { appliedState, windowWidth, elBundle } = params;
    if (
      appliedState &&
      repeatLastComputedValue(
        this.makeRepeatLastComputedValueParams(
          appliedState,
          windowWidth,
          elBundle.el.state
        )
      )
    ) {
      if (appliedState.fluidProperty === this) return appliedState;
      return;
    }

    const { value, fluidRangeIndex } = computeValueAsString({
      ...params,
      fluidRanges: this.fluidRanges,
      property: this.metaData.property,
    });
    return {
      order: this.metaData.order,
      value,
      fluidProperty: this,
      fluidRangeIndex,
    };
  }

  makeRepeatLastComputedValueParams(
    appliedState: AppliedFluidPropertyState,
    windowWidth: number,
    elState: ElementState
  ): RepeatLastComputedValueParams {
    return {
      appliedOrder: appliedState.order,
      appliedFluidRangedHasPercent:
        this.percentTargetForFluidRange[appliedState?.fluidRangeIndex],
      percentTargetState: this.percentTarget?.state,
      order: this.metaData.order,
      elUpdateWidth: elState.updateWidth,
      windowWidth,
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
    percentTargetState,
    windowWidth,
  } = params;

  if (!appliedOrder) return false;

  if (appliedFluidRangedHasPercent && percentTargetState?.percentChangeFlag)
    return false;

  if (order > appliedOrder) return false;

  if (!elUpdateWidth) return false;

  return Math.abs(elUpdateWidth - windowWidth) < 1;
}

function computeValueAsString(params: ComputeValueAsStringParams): {
  value: string;
  fluidRangeIndex: number;
} {
  const state = makeComputationParams(params);

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
  params: ComputeValueAsStringParams
): ComputationParams | null {
  const { currentBreakpointIndex, windowWidth, breakpoints } = params;
  const { fluidRanges, elBundle, property } = params;

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

  return {
    ...currentFluidRange,
    progress,
    elBundle,
    property,
    fluidRangeIndex,
  };
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
