import { isArithemticOperator } from "../../utils";
import {
  ArithemticOperator,
  FluidFunctionValue,
  FluidValue,
  FluidValueBase,
  FunctionType,
} from "../index.types";

function parse3DFluidValues(value: string): FluidValueBase[][] {
  let depth = 0;
  let values: FluidValueBase[][] = [];
  let currentValue = "";
  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    currentValue += char;
    if (char === "(") depth++;
    else if (char === ")") depth--;
    else if (char === "," && depth === 0) {
      values.push(parse2DFluidValues(currentValue));
      currentValue = "";
    } else if (char === " ") continue;
  }
  values.push(parse2DFluidValues(currentValue));
  return values;
}

function parse2DFluidValues(value: string): FluidValueBase[] {
  let depth = 0;
  let currentValue = "";
  let values: FluidValueBase[] = [];
  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    currentValue += char;
    if (char === "(") depth++;
    else if (char === ")") depth--;
    else if (char === " " && depth === 0) {
      values.push(parseFluidValue(currentValue));
      currentValue = "";
    } else if (char === " ") continue;
  }
  values.push(parseFluidValue(currentValue));
  return values;
}

function parseFluidValue(value: string): FluidValueBase {
  let posToPercent: number | undefined;

  if (value === "left" || value === "top") posToPercent = 0;
  else if (value === "right" || value === "bottom") posToPercent = 100;

  if (posToPercent !== undefined)
    return { type: "percent", value: posToPercent } as FluidValueBase;

  const posMatch = value.match(/(left|right|top|bottom)/);

  if (posMatch && !value.startsWith("calc(")) value = `calc(${value})`;

  const funcMatch = value.match(/^(min|max|minmax|clamp|calc)\(/);

  if (funcMatch) {
    return handleFuncMatch(funcMatch, value);
  }
  const number = parseFloat(value);
  const unit = getUnit(value);
  return { value: number, unit } as FluidValue;
}

function handleFuncMatch(funcMatch: RegExpMatchArray, value: string) {
  const funcName = funcMatch[1] as FunctionType;
  let depth = 0;
  let currentValue = "";
  let values: (FluidValueBase | ArithemticOperator)[] = [];
  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    if (char === "(") depth++;
    else if (char === ")") depth--;
    else if (char === "," || isArithemticOperator(char)) {
      values.push(parseFluidValue(currentValue));
      currentValue = "";
      if (isArithemticOperator(char)) {
        values.push(char);
      }
    } else if (char === " ") continue;
    else if (depth >= 1) currentValue += char;
  }
  values.push(parseFluidValue(currentValue));
  return { type: funcName, values } as FluidFunctionValue;
}

function getUnit(value: string): string {
  // Match any alphabetic characters after the number
  const match = String(value).match(/[a-z%]+$/i);
  return match ? match[0] : "px";
}

export { parse3DFluidValues };
