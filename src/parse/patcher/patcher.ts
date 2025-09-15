import { FluidRange, Locks } from "../index.types";
import {
  ApplyNewFluidRangeParams,
  DocStateResult,
  MatchingRuleParams,
  NewFluidRangeParams,
  PropertyParams,
  RuleBatchesParams,
  RuleBatchParams,
  SelectorsParams,
  StyleRuleParams,
} from "../parse.types";
import { parse3DFluidValues } from "./fluidValueParse";

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

  const forceResult: Set<string> | "all" | null = parseForce(
    rule.style["--force"]
  );

  const selectors = splitSelector(rule.selectorText);
  for (const selector of selectors) {
    for (const [property, minValue] of Object.entries(rule.style)) {
      const { newFluidData } = processProperty({
        ...params,
        property,
        minValue,
        selector,
        force: forceResult,
      });
      fluidData = newFluidData;
    }
  }

  return {
    newFluidData: fluidData,
  };
}

function parseForce(forceVarValue: string): Set<string> | "all" | null {
  if (forceVarValue) {
    const forceVarParts = forceVarValue.split(" ");
    if (forceVarParts.includes("all")) {
      return "all";
    } else {
      return new Set(forceVarParts);
    }
  }
  return null;
}

function processProperty(
  params: PropertyParams
): Pick<DocStateResult, "newFluidData"> {
  const { property, minValue, force, breakpoints } = params;

  const doForce = force === "all" || force?.has(property);

  if (doForce)
    return processMatchingRule({
      ...params,
      maxValue: minValue,
      nextBatchWidth: breakpoints[breakpoints.length - 1],
    });

  return processNextBatches({ ...params });
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
            nextBatchWidth: nextRuleBatch.width,
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
  const { minValue, maxValue, breakpoints, batchWidth, nextBatchWidth, rule } =
    params;

  let lockResult: Locks = parseLocks(rule.style["--lock"]);

  const result = {
    minValue: parse3DFluidValues(minValue),
    maxValue: parse3DFluidValues(maxValue),
    minIndex: breakpoints.indexOf(batchWidth),
    maxIndex: breakpoints.indexOf(nextBatchWidth),
  } as FluidRange;

  if (lockResult) {
    result.locks = lockResult;
  }

  return result;
}

function parseLocks(lockVarValue: string): Locks {
  if (lockVarValue) {
    const lockVarParts = lockVarValue.split(" ");
    if (lockVarParts.includes("all")) {
      return "all";
    } else {
      return new Set(lockVarParts);
    }
  }
  return null;
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

export {
  processRuleBatches,
  processRuleBatch,
  processSelectors,
  processNextBatches,
  processMatchingRule,
  makeNewFluidRange,
  applyNewFluidRange,
};
