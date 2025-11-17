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
  HandleAutoForcedPropertyContext,
  InsertFluidRangeContext,
  ParseDocContext,
  ProcessPropertyContext,
  ProcessSelectorInRuleContext,
  RuleBatch,
  SeekAndInsertFluidRangeContext,
} from "./index.types";

let parseDoc = (doc: DocClone, ctx: ParseDocContext): DocParserResults => {
  const { breakpoints, globalBaselineWidth } =
    extractBreakpointsAndBaseline(doc);

  const batches = createBatches(doc, globalBaselineWidth, ctx);

  //NEW BEGIN
  const fluidData = processBatches(batches, ctx);
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

let processBatches = (
  batches: RuleBatch[],
  ctx: ParseDocContext
): FluidData => {
  let fluidData = new FluidData(ctx);
  for (const [batchIndex, batch] of batches.entries()) {
    const { rules, width } = batch;
    for (const rule of rules) {
      for (const selector of splitSelector(rule.selector)) {
        fluidData = processSelectorInRule(selector, rule, {
          ...ctx,
          batchIndex,
          batches,
          width,
          fluidData,
        });
      }
    }
  }
  return fluidData;
};

let processSelectorInRule = (
  selector: string,
  rule: StyleRuleClone,
  ctx: ProcessSelectorInRuleContext
): FluidData => {
  let { fluidData } = ctx;
  for (const property in rule.style) {
    fluidData = processProperty(property, rule, {
      ...ctx,
      selector,
      fluidData,
    });
  }
  return fluidData;
};

let processProperty = (
  property: string,
  rule: StyleRuleClone,
  ctx: ProcessPropertyContext
): FluidData => {
  let { fluidData } = ctx;
  const minValue = rule.style[property];

  const { didMatch, newFluidData } = seekAndInsertFluidRange(
    property,
    minValue,
    { ...ctx, rule }
  );
  fluidData = newFluidData;
  const { autoForce } = ctx;
  if (!didMatch && autoForce) {
    fluidData = handleAutoForcedProperty(fluidData, {
      ...ctx,
      property,
      minValue,
      rule,
    });
  }
  return fluidData;
};

let seekAndInsertFluidRange = (
  property: string,
  minValue: string,
  ctx: SeekAndInsertFluidRangeContext
): { didMatch: boolean; newFluidData: FluidData } => {
  const { selector, batches, batchIndex, rule, seekAlg, event } = ctx;
  let { fluidData } = ctx;
  let mediaSeen = false;
  seekMaxLoop: for (const nextBatch of batches.slice(batchIndex + 1)) {
    if (shouldStopSeeking(nextBatch, mediaSeen, seekAlg)) {
      break seekMaxLoop;
    }
    if (nextBatch.isMedia) {
      mediaSeen = true;
    }
    for (const nextRule of nextBatch.rules) {
      if (!splitSelector(nextRule.selector).includes(selector)) {
        continue;
      }
      const nextValue = nextRule.style[property];
      if (nextValue) {
        fluidData = insertFluidRange(fluidData, {
          ...ctx,
          property,
          rule,
          nextValue,
          nextBatch,
          minValue,
        });
        return { didMatch: true, newFluidData: fluidData };
      }
    }
  }
  if (dev)
    event?.emit("omitFluidDataInsertion", ctx, {
      selector,
      property,
      rule,
      why: "noMatch",
    });
  return { didMatch: false, newFluidData: fluidData };
};

function shouldStopSeeking(
  nextBatch: RuleBatch,
  mediaSeen: boolean,
  seekAlg: string
): boolean {
  if (!nextBatch.isMedia) {
    if (
      seekAlg === "stopAt1stNonMedia" ||
      (seekAlg === "stopAfterMedia" && mediaSeen)
    ) {
      return true;
    }
  }
  return false;
}

let insertFluidRange = (fluidData: FluidData, ctx: InsertFluidRangeContext) => {
  const { selector, property, rule, nextValue, width } = ctx;
  const { nextBatch, minValue, event } = ctx;
  const anchor = extractAnchor(selector);
  fluidData = cloneFluidDataAt(fluidData, anchor, selector, property);
  const propertyData =
    fluidData.anchors[anchor].selectors[selector].addRangedProperty(property);
  propertyData.ranges.push({
    minBp: width,
    maxBp: nextBatch.width,
    minValue: parseFluidValue2D(minValue),
    maxValue: parseFluidValue2D(nextValue),
  });
  propertyData.metaData.orderID = rule.orderID;
  if (dev)
    event?.emit("insertFluidData", ctx, {
      type: "range",
      rule,
      anchor,
      selector,
      property,
      rangeIndex: propertyData.ranges.length - 1,
      propertyData,
      width,
    });
  return fluidData;
};

let cloneFluidDataAt = (
  fluidData: FluidData,
  anchor: string,
  selector: string,
  property: string
): FluidData => {
  const newFluidData = new FluidData(fluidData.global);
  newFluidData.anchors = { ...fluidData.anchors };

  if (newFluidData.anchors[anchor]) {
    const anchorData = (newFluidData.anchors[anchor] =
      newFluidData.anchors[anchor].clone());

    if (anchorData.selectors[selector]) {
      const selectorData = (anchorData.selectors[selector] =
        anchorData.selectors[selector].clone());

      if (selectorData.properties[property])
        selectorData.properties[property] =
          selectorData.properties[property].clone();
    }
  }

  const anchorData = newFluidData.addAnchor(anchor);
  anchorData.addSelector(selector);

  return newFluidData;
};

let handleAutoForcedProperty = (
  fluidData: FluidData,
  ctx: HandleAutoForcedPropertyContext
) => {
  const { selector, property, rule, minValue, event } = ctx;
  const anchor = extractAnchor(selector);
  if (fluidData.anchors[anchor]?.selectors[selector]?.properties[property]) {
    if (dev)
      event?.emitOne(
        "omitFluidDataInsertion",
        ctx,
        {
          selector,
          property,
          rule,
        },
        { why: "propertyAlreadyExists" }
      );
    return fluidData;
  }
  fluidData = cloneFluidDataAt(fluidData, anchor, selector, property);

  const propertyData =
    fluidData.anchors[anchor].selectors[selector].addAutoForcedProperty(
      property
    );
  propertyData.value = minValue;
  propertyData.metaData.orderID = rule.orderID;
  if (dev)
    event?.emitOne(
      "insertFluidData",
      ctx,
      {
        selector,
        property,
        rule,
      },
      {
        type: "forced",
        anchor,
        propertyData,
      }
    );
  return fluidData;
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
  findBaselineMediaQueryWrapped: typeof findBaselineMediaQuery,
  processBatchesWrapped: typeof processBatches,
  processSelectorInRuleWrapped: typeof processSelectorInRule,
  processPropertyWrapped: typeof processProperty,
  seekAndInsertFluidRangeWrapped: typeof seekAndInsertFluidRange,
  insertFluidRangeWrapped: typeof insertFluidRange,
  handleAutoForcedPropertyWrapped: typeof handleAutoForcedProperty,
  cloneFluidDataAtWrapped: typeof cloneFluidDataAt
) {
  parseDoc = parseDocWrapped;
  extractBreakpointsAndBaseline = extractBreakpointsAndBaselineWrapped;
  batchStyleRule = batchStyleRuleWrapped;
  batchMediaRule = batchMediaRuleWrapped;
  createBatches = createBatchesWrapped;
  resolveBaselineWidth = resolveBaselineWidthWrapped;
  findBaselineMediaQuery = findBaselineMediaQueryWrapped;
  processBatches = processBatchesWrapped;
  processSelectorInRule = processSelectorInRuleWrapped;
  processProperty = processPropertyWrapped;
  seekAndInsertFluidRange = seekAndInsertFluidRangeWrapped;
  insertFluidRange = insertFluidRangeWrapped;
  handleAutoForcedProperty = handleAutoForcedPropertyWrapped;
  cloneFluidDataAt = cloneFluidDataAtWrapped;
}

export {
  parseDoc,
  extractBreakpointsAndBaseline,
  batchStyleRule,
  batchMediaRule,
  createBatches,
  resolveBaselineWidth,
  findBaselineMediaQuery,
  processBatches,
  processSelectorInRule,
  processProperty,
  seekAndInsertFluidRange,
  shouldStopSeeking,
  insertFluidRange,
  handleAutoForcedProperty,
  cloneFluidDataAt,
  wrap,
};
