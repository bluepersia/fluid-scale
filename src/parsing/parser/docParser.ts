import { MEDIA_RULE_TYPE, STYLE_RULE_TYPE } from "../../index.types";
import type {
  DocClone,
  MediaRuleClone,
  SheetClone,
  StyleRuleClone,
} from "../serialization/docClone";
import type { BatchState, DocParserResults, RuleBatch } from "./index.types";

let parseDoc = (doc: DocClone): DocParserResults => {
  const { breakpoints, globalBaselineWidth } =
    extractBreakpointsAndBaseline(doc);

  const batches = createBatches(doc, globalBaselineWidth);

  return {
    breakpoints,
    batches,
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
  globalBaselineWidth: number
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
        batchState = batchMediaRule(rule as MediaRuleClone, batchState);
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
  if (newBatchState.currentBatch === null) {
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

let batchMediaRule = (mediaRule: MediaRuleClone, batchState: BatchState) => {
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
  return newBatchState;
};
function wrap(
  parseDocWrapped: typeof parseDoc,
  extractBreakpointsAndBaselineWrapped: typeof extractBreakpointsAndBaseline,
  batchStyleRuleWrapped: typeof batchStyleRule,
  batchMediaRuleWrapped: typeof batchMediaRule,
  createBatchesWrapped: typeof createBatches
) {
  parseDoc = parseDocWrapped;
  extractBreakpointsAndBaseline = extractBreakpointsAndBaselineWrapped;
  batchStyleRule = batchStyleRuleWrapped;
  batchMediaRule = batchMediaRuleWrapped;
  createBatches = createBatchesWrapped;
}

export {
  parseDoc,
  extractBreakpointsAndBaseline,
  batchStyleRule,
  batchMediaRule,
  createBatches,
  wrap,
};
