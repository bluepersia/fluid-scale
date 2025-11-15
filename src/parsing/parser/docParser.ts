import { MEDIA_RULE_TYPE } from "../../index.types";
import type { DocClone, MediaRuleClone } from "../serialization/docClone";

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
  return {
    breakpoints: Array.from(uniqueBreakpoints),
  };
};

function wrap(parseDocWrapped: typeof parseDoc) {
  parseDoc = parseDocWrapped;
}

export { parseDoc, wrap };
