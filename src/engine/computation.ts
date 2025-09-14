import {
  ArithemticOperator,
  FluidFunctionValue,
  FluidRange,
  FluidValue,
  FluidValueBase,
} from "../parse/index.types";
import { getState } from "./engine";
import {
  ComputationParams,
  ConvertToPxParams,
  ValueComputationParams,
} from "./engine.types";

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

function computeValue(params: ComputationParams): (number | string)[][] {
  const { progress, minValue, maxValue, el, property } = params;
  if (progress <= 0)
    return minValue.map((group) =>
      group.map((value) => computeFluidValue(value, el, property))
    );
  else if (progress >= 1)
    return maxValue.map((group) =>
      group.map((value) => computeFluidValue(value, el, property))
    );
  else {
    return interpolateFluidValue(params);
  }
}

function computeFluidValue(
  fluidValueBase: FluidValueBase,
  el: HTMLElement,
  property: string
): number | string {
  const fluidFuncValue = fluidValueBase as FluidFunctionValue;

  if (fluidFuncValue.type)
    return computeFuncValue(fluidFuncValue, el, property);
  else {
    const { value, unit } = fluidValueBase as FluidValue;
    return computeSingleValue({ value, unit, el, property });
  }
}

function computeFuncValue(
  func: FluidFunctionValue,
  el: HTMLElement,
  property: string
): number | string {
  const { type, values } = func;

  if (type === "calc") return calcExpression(values, el, property);

  const valuesPx = values.map(
    (value) => computeFluidValue(value, el, property) as number
  );
  switch (type) {
    case "min":
      return Math.min(...valuesPx);
    case "max":
      return Math.max(...valuesPx);
    case "clamp":
      return Math.max(Math.min(valuesPx[0], valuesPx[1]), valuesPx[2]);
    case "minmax":
      return Math.min(Math.max(valuesPx[0], valuesPx[1]), valuesPx[2]);
  }
  throw new Error(`Unknown calc type: ${type}`);
}

function calcExpression(
  values: (FluidValueBase | string)[],
  el: HTMLElement,
  property: string
): number | string {
  const expression = values
    .map((value) => {
      if (typeof value === "string") {
        if (isArithemticOperator(value)) return value;
        if (value === "none") throw Error("None in calc");
      }

      return computeFluidValue(value, el, property);
    })
    .join("");

  if (!/^[\d+\-*/().\s]+$/.test(expression)) {
    console.log(expression);
    throw new Error("Unsafe expression");
  }

  return new Function(`return (${expression})`)();
}

function isArithemticOperator(value: string): value is ArithemticOperator {
  return value === "+" || value === "-" || value === "*" || value === "/";
}

function computeSingleValue(params: ValueComputationParams): number | string {
  const { value, unit, el, property } = params;
  if (typeof value === "number" && typeof unit === "string") {
    return convertToPx({ ...params, value });
  } else if (typeof value === "string") {
    return measureKeywordValue(el, property, value);
  }
  throw new Error(`Unknown value or unit: ${value} ${unit}`);
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

function measureKeywordValue(
  el: HTMLElement,
  property: string,
  keyword: string
): number | string {
  if (property.startsWith("margin-") && keyword === "auto") return "auto";

  const prevValue = el.style.getPropertyValue(property);
  el.style.setProperty(property, keyword);

  const px = window.getComputedStyle(el).getPropertyValue(property);

  el.style.setProperty(property, prevValue);

  return parseFloat(px) || px;
}

function interpolateFluidValue(
  params: ComputationParams
): (number | string)[][] {
  const { minValue, maxValue, progress, el, property } = params;
  const minValuePxs = minValue.map((group) =>
    group.map((value) => computeFluidValue(value, el, property))
  );
  const maxValuePxs = maxValue.map((group) =>
    group.map((value) => computeFluidValue(value, el, property))
  );
  return minValuePxs.map((group, groupIndex) =>
    group.map((value, valueIndex) => {
      if (typeof value === "string") return value;

      const maxValue = maxValuePxs[groupIndex]?.[valueIndex];

      if (typeof maxValue === "string") return value;

      if (maxValue) return value + (maxValue - value) * progress;
      else return value;
    })
  );
}

export {
  repeatLastComputedValue,
  computeValueAsString,
  makeComputationParams,
  computeValue,
  convertToPx,
  interpolateFluidValue,
};
