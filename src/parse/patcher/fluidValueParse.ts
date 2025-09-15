import {
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
  const funcMatch = value.match(/^(min|max|minmax|clamp|calc)\(/);

  if (funcMatch) {
    const funcName = funcMatch[1] as FunctionType;
    let depth = 0;
    let currentValue = "";
    let values: FluidValueBase[] = [];
    for (let i = 0; i < value.length; i++) {
      const char = value[i];
      if (char === "(") depth++;
      else if (char === ")") depth--;
      if (depth >= 1) currentValue += char;
      if (char === ",") {
        values.push(parseFluidValue(currentValue));
        currentValue = "";
      }
    }
    values.push(parseFluidValue(currentValue));
    return { type: funcName, values } as FluidFunctionValue;
  }
  const number = parseFloat(value);
  const unit = getUnit(value);
  return { value: number, unit } as FluidValue;
}

function getUnit(value: string): string {
  // Match any alphabetic characters after the number
  const match = String(value).match(/[a-z%]+$/i);
  return match ? match[0] : "px";
}
