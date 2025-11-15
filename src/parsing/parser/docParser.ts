import { MEDIA_RULE_TYPE, STYLE_RULE_TYPE } from "../../index.types";
import type {
  DocClone,
  MediaRuleClone,
  StyleRuleClone,
} from "../serialization/docClone";
import type { BatchState } from "./index.types";

let parseDoc = (doc: DocClone) => {
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

  globalBaselineWidth = globalBaselineWidth;

  const batchState: BatchState = {
    currentBatch: null,
    batches: [],
  };

  for (const sheet of doc.sheets) {
    const baselineMediaQuery = sheet.rules.find(
      (rule) =>
        rule.type === MEDIA_RULE_TYPE &&
        (rule as MediaRuleClone).rules.length <= 0
    ) as MediaRuleClone | undefined;

    const baselineWidth = baselineMediaQuery
      ? baselineMediaQuery.minWidth
      : globalBaselineWidth;

    for (const rule of sheet.rules) {
      if (rule.type === STYLE_RULE_TYPE) {
        const styleRule = rule as StyleRuleClone;
        if (batchState.currentBatch === null) {
          batchState.currentBatch = {
            rules: [],
            width: baselineWidth,
            isMedia: false,
          };
          batchState.batches.push(batchState.currentBatch);
        }
        batchState.currentBatch.rules.push(styleRule);
      }
      if (rule.type === MEDIA_RULE_TYPE) {
        const mediaRule = rule as MediaRuleClone;
        batchState.currentBatch = null;
        batchState.batches.push({
          rules: mediaRule.rules,
          width: mediaRule.minWidth,
          isMedia: true,
        });
      }
    }
  }

  return {
    breakpoints: Array.from(uniqueBreakpoints),
  };
};

function wrap(parseDocWrapped: typeof parseDoc) {
  parseDoc = parseDocWrapped;
}

export { parseDoc, wrap };
