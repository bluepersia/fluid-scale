import {
  FluidFunctionValue,
  FluidValue,
  FluidValueBase,
} from "../parse/index.types";
import { isArithemticOperator } from "../utils";
import { getState } from "./engine";
import {
  ComputationParams,
  ConvertToPxParams,
  ValueComputationParams,
} from "./engine.types";

function computeValue(params: ComputationParams): (number | string)[][] {
  const { progress, minValue, maxValue, el, property } = params;
  if (progress <= 0) return calculateFluidArray(minValue, el, property);
  else if (progress >= 1) return calculateFluidArray(maxValue, el, property);
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

function computeGridValue(
  el: HTMLElement,
  property: string,
  value: string
): number[] {
  // Clone the element
  const clone = cloneElForMeasurement(el, property, value);

  const gridTemplate = window
    .getComputedStyle(clone)
    .getPropertyValue(property);

  document.body.removeChild(clone);

  const gridTemplateArray = gridTemplate.split(" ");
  const gridTemplateValues = gridTemplateArray.map((value) => {
    return parseFloat(value);
  });
  return gridTemplateValues;
}

function measureKeywordValue(
  el: HTMLElement,
  property: string,
  keyword: string
): number | string {
  if (property.startsWith("margin-") && keyword === "auto") return "auto";

  const clone = cloneElForMeasurement(el, property, keyword);

  const px = window.getComputedStyle(clone).getPropertyValue(property);

  // Remove the clone
  document.body.removeChild(clone);

  return parseFloat(px) || px;
}

function cloneElForMeasurement(
  el: HTMLElement,
  property: string,
  value: string
): HTMLElement {
  const clone = el.cloneNode(true) as HTMLElement;
  clone.style.visibility = "hidden";
  clone.style.position = "absolute";
  clone.style.setProperty(property, value);
  return clone;
}

function interpolateFluidValue(
  params: ComputationParams
): (number | string)[][] {
  const { minValue, maxValue, progress, el, property, locks } = params;
  const minValuePxs = calculateFluidArray(minValue, el, property);
  const maxValuePxs = calculateFluidArray(maxValue, el, property);

  return minValuePxs.map((group, groupIndex) =>
    group.map((value, valueIndex) => {
      if (
        typeof value === "string" ||
        locks === "all" ||
        locks?.has(property) ||
        (minValuePxs.length <= 1
          ? locks?.has(`${property}/${valueIndex}`)
          : locks?.has(`${property}/${groupIndex}/${valueIndex}`))
      )
        return value;

      const maxValue = maxValuePxs[groupIndex]?.[valueIndex];

      if (typeof maxValue === "string") return value;

      if (maxValue) return value + (maxValue - value) * progress;
      else return value;
    })
  );
}

function calculateFluidArray(
  fluidValues: FluidValueBase[][],
  el: HTMLElement,
  property: string
): (number | string)[][] {
  const isGrid = property.startsWith("grid-");

  return fluidValues.map((group) =>
    isGrid
      ? computeGridValue(el, property, group.join(" "))
      : group.map((value) => computeFluidValue(value, el, property))
  );
}

export { computeValue, convertToPx, interpolateFluidValue, computeSingleValue };
