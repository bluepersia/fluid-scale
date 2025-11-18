import { FluidData } from "../../fluidData";
import { MEDIA_RULE_TYPE, STYLE_RULE_TYPE } from "../../index.types";
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
  ProcessPropertyContext,
  ProcessSelectorInRuleContext,
  RuleBatch,
} from "./index.types";
import {
  cloneFluidDataAt,
  wrap as fluidDataPatcherWrap,
  handleAutoForcedProperty,
  insertFluidRange,
  seekAndInsertFluidRange,
} from "./fluidDataPatcher";

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

function splitSelector(selector: string) {
  return selector.split(",").map((s) => s.trim());
}

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
  fluidDataPatcherWrap(
    seekAndInsertFluidRangeWrapped,
    insertFluidRangeWrapped,
    cloneFluidDataAtWrapped,
    handleAutoForcedPropertyWrapped
  );
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
  splitSelector,
  wrap,
};
