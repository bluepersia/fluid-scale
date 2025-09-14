import { FluidRange } from "../parse/index.types";
import { getState } from "./engine";
import {
  AppliedFluidPropertyState,
  ComputationParams,
  ConvertToPxParams,
} from "./engine.types";

function isLowerOrder(currentOrder: number, otherOrder: number): boolean {
  return currentOrder < otherOrder;
}

function repeatLastComputedValue(
  applied:
    | Omit<AppliedFluidPropertyState, "value" | "fluidProperty">
    | undefined,
  order: number
): boolean {
  if (!applied) return false;

  if (order > applied.order) return false;

  const {
    windowSize: [windowWidth],
  } = getState();
  if (Math.abs(applied.windowWidth - windowWidth) < 1) return true;

  return false;
}

function computeValueAsString(
  fluidRanges: (FluidRange | null)[],
  el: HTMLElement,
  property: string
): string {
  const state = makeComputationParams(fluidRanges, el, property);

  if (!state) return "";

  const value = computeValue(state);

  if (typeof value === "number") return `${value}px`;
  else return value;
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

function computeValue(params: ComputationParams): number {
  const { progress, minValue, maxValue } = params;
  if (progress <= 0)
    return convertToPx({
      value: minValue.value,
      unit: minValue.unit,
      ...params,
    });
  else if (progress >= 1)
    return convertToPx({
      value: maxValue.value,
      unit: maxValue.unit,
      ...params,
    });
  else {
    return interpolateFluidValue(params);
  }
}

function convertToPx(params: ConvertToPxParams): number {
  const { value, unit, el, property } = params;
  const { windowSize } = getState();
  switch (unit) {
    case "px":
      return value;
    case "em": {
      if (property === "font-size") {
        const parent = el.parentElement || document.documentElement;
        return value * parseFloat(getComputedStyle(parent).fontSize);
      } else {
        return value * parseFloat(getComputedStyle(el).fontSize);
      }
    }
    case "rem":
      return (
        value * parseFloat(getComputedStyle(document.documentElement).fontSize)
      );
    case "vw":
      return (value * windowSize[0]) / 100;
    case "vh":
      return (value * windowSize[1]) / 100;
  }
  throw Error(`Unsupported unit ${unit}`);
}

function interpolateFluidValue(params: ComputationParams): number {
  const { minValue, maxValue, progress } = params;
  const minValuePx = convertToPx({
    value: minValue.value,
    unit: minValue.unit,
    ...params,
  });
  const maxValuePx = convertToPx({
    value: maxValue.value,
    unit: maxValue.unit,
    ...params,
  });
  return minValuePx + (maxValuePx - minValuePx) * progress;
}

export {
  isLowerOrder,
  repeatLastComputedValue,
  computeValueAsString,
  makeComputationParams,
  computeValue,
  convertToPx,
  interpolateFluidValue,
};
