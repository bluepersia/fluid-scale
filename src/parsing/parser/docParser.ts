import { FluidData } from "../../fluidData";
import {
  MEDIA_RULE_TYPE,
  STYLE_RULE_TYPE,
  type FluidValue,
  type FluidValueSingle,
} from "../../index.types";
import { splitBySpaces } from "../../utils/stringHelpers";
import type {
  DocClone,
  MediaRuleClone,
  SheetClone,
  StyleRuleClone,
} from "../serialization/docClone";
import type {
  BatchState,
  DocParserResults,
  ParseDocContext,
  RuleBatch,
} from "./index.types";

let parseDoc = (doc: DocClone, ctx: ParseDocContext): DocParserResults => {
  const { breakpoints, globalBaselineWidth } =
    extractBreakpointsAndBaseline(doc);

  const batches = createBatches(doc, globalBaselineWidth, ctx);

  //NEW BEGIN
  const fluidData = new FluidData(ctx);
  for (const [batchIndex, batch] of batches.entries()) {
    const { rules, width } = batch;
    for (const rule of rules) {
      for (const selector of splitSelector(rule.selector)) {
        for (const property in rule.style) {
          const minValue = rule.style[property];

          let mediaSeen = false;
          const { seekAlg } = ctx;
          let didMatch = false;
          seekMaxLoop: for (const nextBatch of batches.slice(batchIndex + 1)) {
            if (!nextBatch.isMedia) {
              if (
                seekAlg === "stopAt1stNonMedia" ||
                (seekAlg === "stopAfterMedia" && mediaSeen)
              ) {
                break seekMaxLoop;
              }
            } else {
              mediaSeen = true;
            }
            for (const nextRule of nextBatch.rules) {
              if (!splitSelector(nextRule.selector).includes(selector)) {
                continue;
              }
              const nextValue = nextRule.style[property];
              if (nextValue) {
                didMatch = true;
                const anchor = extractAnchor(selector);
                const anchorData = fluidData.addAnchor(anchor);
                const selectorData = anchorData.addSelector(selector);
                const propertyData = selectorData.addRangedProperty(property);
                propertyData.ranges.push({
                  minBp: width,
                  maxBp: nextBatch.width,
                  minValue: parseFluidValue2D(minValue),
                  maxValue: parseFluidValue2D(nextValue),
                });
              }
            }
          }
          const { autoForce } = ctx;
          if (!didMatch && autoForce) {
            const anchor = extractAnchor(selector);
            const anchorData = fluidData.addAnchor(anchor);
            const selectorData = anchorData.addSelector(selector);
            if (selectorData.properties[property]) {
              continue;
            }
            const propertyData = selectorData.addAutoForcedProperty(property);
            propertyData.value = minValue;
          }
        }
      }
    }
  }
  //NEW END

  return {
    breakpoints,
    fluidData,
  };
};

let extractBreakpointsAndBaseline = (
  doc: DocClone
): { breakpoints: number[]; globalBaselineWidth: number } => {
  const uniqueBreakpoints: Set<number> = new Set();
  let globalBaselineWidth = 375;

  for (const sheet of doc.sheets) {
    for (const rule of sheet.rules) {
      if (rule.type === MEDIA_RULE_TYPE) {
        const mediaRule = rule as MediaRuleClone;
        const { minWidth } = mediaRule;
        uniqueBreakpoints.add(minWidth);
        if (mediaRule.rules.length <= 0) globalBaselineWidth = minWidth;
      }
    }
  }

  return {
    breakpoints: Array.from(uniqueBreakpoints),
    globalBaselineWidth: globalBaselineWidth,
  };
};

let resolveBaselineWidth = (
  sheet: SheetClone,
  globalBaselineWidth: number
): number => {
  const baselineMediaQuery = findBaselineMediaQuery(sheet);
  return baselineMediaQuery ? baselineMediaQuery.minWidth : globalBaselineWidth;
};

let findBaselineMediaQuery = (
  sheet: SheetClone
): MediaRuleClone | undefined => {
  return sheet.rules.find(
    (rule) =>
      rule.type === MEDIA_RULE_TYPE &&
      (rule as MediaRuleClone).rules.length <= 0
  ) as MediaRuleClone | undefined;
};

let createBatches = (
  doc: DocClone,
  globalBaselineWidth: number,
  ctx: ParseDocContext
): RuleBatch[] => {
  let batchState: BatchState = {
    currentBatch: null,
    batches: [],
  };

  for (const sheet of doc.sheets) {
    const baselineWidth = resolveBaselineWidth(sheet, globalBaselineWidth);

    for (const rule of sheet.rules) {
      if (rule.type === STYLE_RULE_TYPE) {
        batchState = batchStyleRule(
          rule as StyleRuleClone,
          batchState,
          baselineWidth
        );
      }
      if (rule.type === MEDIA_RULE_TYPE) {
        batchState = batchMediaRule(rule as MediaRuleClone, batchState, ctx);
      }
    }
  }

  return batchState.batches;
};

let batchStyleRule = (
  styleRule: StyleRuleClone,
  batchState: BatchState,
  baselineWidth: number
) => {
  const newBatchState = { ...batchState };
  if (
    newBatchState.currentBatch === null ||
    newBatchState.currentBatch.width !== baselineWidth
  ) {
    newBatchState.currentBatch = {
      rules: [],
      width: baselineWidth,
      isMedia: false,
    };
    newBatchState.batches = [
      ...newBatchState.batches,
      newBatchState.currentBatch,
    ];
  } else {
    newBatchState.currentBatch = { ...newBatchState.currentBatch };
    newBatchState.batches = [...newBatchState.batches];
    newBatchState.batches[newBatchState.batches.length - 1] =
      newBatchState.currentBatch;
  }
  newBatchState.currentBatch.rules = [
    ...newBatchState.currentBatch.rules,
    styleRule,
  ];
  return newBatchState;
};

let batchMediaRule = (
  mediaRule: MediaRuleClone,
  batchState: BatchState,
  ctx: ParseDocContext
) => {
  const { event } = ctx;
  if (mediaRule.rules.length <= 0) {
    if (dev) {
      event?.emit("omitMediaRule", ctx, { why: "noRules" });
    }
    return batchState;
  }
  const newBatchState = { ...batchState };
  newBatchState.currentBatch = null;
  newBatchState.batches = [
    ...newBatchState.batches,
    {
      rules: mediaRule.rules,
      width: mediaRule.minWidth,
      isMedia: true,
    },
  ];
  if (dev) {
    event?.emit("batchMediaRule", ctx, { mediaRule });
  }
  return newBatchState;
};

function splitSelector(selector: string) {
  return selector.split(",").map((s) => s.trim());
}

function extractAnchor(selector: string) {
  const selectorParts = selector.split(" ");
  return selectorParts[selectorParts.length - 1];
}

function parseFluidValue2D(value: string): FluidValue[][] {
  let depth = 0;
  let currentValue = "";
  let values: FluidValue[][] = [];
  for (const char of value) {
    if (char === "(") {
      depth++;
    } else if (char === ")") {
      depth--;
    } else if (char === "," && depth === 0) {
      values.push(parseFluidValue1D(currentValue.trim()));
      currentValue = "";
    } else {
      currentValue += char;
    }
  }
  values.push(parseFluidValue1D(currentValue.trim()));

  return values;
}

function parseFluidValue1D(value: string): FluidValue[] {
  const values: string[] = splitBySpaces(value);
  return values.map((value) => parseFluidValue(value));
}

function parseFluidValue(strValue: string): FluidValue {
  const value = parseFloat(strValue);

  // Match any alphabetic characters after the number
  const match = strValue.match(/[a-z%]+$/i);
  const unit = match?.[0] || "";

  return {
    value,
    unit,
    type: "single",
  } as FluidValueSingle;
}
function wrap(
  parseDocWrapped: typeof parseDoc,
  extractBreakpointsAndBaselineWrapped: typeof extractBreakpointsAndBaseline,
  batchStyleRuleWrapped: typeof batchStyleRule,
  batchMediaRuleWrapped: typeof batchMediaRule,
  createBatchesWrapped: typeof createBatches,
  resolveBaselineWidthWrapped: typeof resolveBaselineWidth,
  findBaselineMediaQueryWrapped: typeof findBaselineMediaQuery
) {
  parseDoc = parseDocWrapped;
  extractBreakpointsAndBaseline = extractBreakpointsAndBaselineWrapped;
  batchStyleRule = batchStyleRuleWrapped;
  batchMediaRule = batchMediaRuleWrapped;
  createBatches = createBatchesWrapped;
  resolveBaselineWidth = resolveBaselineWidthWrapped;
  findBaselineMediaQuery = findBaselineMediaQueryWrapped;
}

export {
  parseDoc,
  extractBreakpointsAndBaseline,
  batchStyleRule,
  batchMediaRule,
  createBatches,
  resolveBaselineWidth,
  findBaselineMediaQuery,
  wrap,
};
