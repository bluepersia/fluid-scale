import {
  FluidFunctionValue,
  FluidRange,
  FluidValue,
  FluidValueBase,
  FunctionType,
} from "./index.types";
import {
  ApplyNewFluidRangeParams,
  DocStateResult,
  MatchingRuleParams,
  NewFluidRangeParams,
  RuleBatchesParams,
  RuleBatchParams,
  SelectorsParams,
  StyleRuleParams,
} from "./parse.types";

function processRuleBatches(params: RuleBatchesParams): DocStateResult {
  const { ruleBatches } = params;
  let { fluidData, order } = params;
  for (const [batchIndex, ruleBatch] of ruleBatches.entries()) {
    const { newFluidData, newOrder } = processRuleBatch({
      ruleBatch,
      batchIndex,
      ...params,
    });
    fluidData = newFluidData;
    order = newOrder;
  }

  return {
    newFluidData: fluidData,
    newOrder: order,
  };
}

function processRuleBatch(params: RuleBatchParams): DocStateResult {
  const { ruleBatch } = params;
  let { order, fluidData } = params;

  for (const rule of ruleBatch.styleRules) {
    const { newFluidData } = processSelectors({
      rule,
      batchWidth: ruleBatch.width,
      ...params,
    });
    order++;
    fluidData = newFluidData;
  }

  return {
    newFluidData: fluidData,
    newOrder: order,
  };
}

function processSelectors(
  params: SelectorsParams
): Pick<DocStateResult, "newFluidData"> {
  const { rule } = params;
  let { fluidData } = params;

  const selectors = splitSelector(rule.selectorText);
  for (const selector of selectors) {
    for (const [property, minValue] of Object.entries(rule.style)) {
      const { newFluidData } = processNextBatches({
        property,
        minValue,
        selector,
        ...params,
      });
      fluidData = newFluidData;
    }
  }

  return {
    newFluidData: fluidData,
  };
}

function processNextBatches(
  params: StyleRuleParams
): Pick<DocStateResult, "newFluidData"> {
  const { selector, batchIndex, ruleBatches, property } = params;
  let { fluidData } = params;

  for (let i = batchIndex + 1; i < ruleBatches.length; i++) {
    const nextRuleBatch = ruleBatches[i];
    for (const nextRule of nextRuleBatch.styleRules) {
      if (splitSelector(nextRule.selectorText).includes(selector)) {
        const maxValue = nextRule.style[property];
        if (maxValue) {
          const { newFluidData } = processMatchingRule({
            nextRuleBatch,
            maxValue,
            ...params,
          });
          fluidData = newFluidData;
        }
      }
    }
  }

  return {
    newFluidData: fluidData,
  };
}

function processMatchingRule(
  params: MatchingRuleParams
): Pick<DocStateResult, "newFluidData"> {
  const fluidRange: FluidRange = makeNewFluidRange(params);
  return applyNewFluidRange({ fluidRange, ...params });
}

function makeNewFluidRange(params: NewFluidRangeParams): FluidRange {
  const { minValue, maxValue, breakpoints, batchWidth, nextRuleBatch } = params;
  return {
    minValue: parse3DFluidValues(minValue),
    maxValue: parse3DFluidValues(maxValue),
    minIndex: breakpoints.indexOf(batchWidth),
    maxIndex: breakpoints.indexOf(nextRuleBatch.width),
  };
}

function applyNewFluidRange(
  params: ApplyNewFluidRangeParams
): Pick<DocStateResult, "newFluidData"> {
  const { fluidRange, fluidData, selector, property, order } = params;

  const selectorParts = selector.split(" ");
  const anchor = selectorParts[selectorParts.length - 1];
  const anchorData = { ...(fluidData[anchor] || {}) };

  const selectorData = { ...(anchorData[selector] || {}) };
  anchorData[selector] = selectorData;

  const propertyData = {
    ...(selectorData[property] || {
      metaData: {
        order,
        property,
      },
      fluidRanges: [],
    }),
  };
  selectorData[property] = propertyData;

  propertyData.fluidRanges = [...propertyData.fluidRanges, fluidRange];

  return {
    newFluidData: { ...fluidData, [anchor]: anchorData },
  };
}

function splitSelector(selector: string): string[] {
  return selector.split(",").map((s) => s.trim());
}

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

export {
  processRuleBatches,
  processRuleBatch,
  processSelectors,
  processNextBatches,
  processMatchingRule,
  makeNewFluidRange,
  applyNewFluidRange,
};
