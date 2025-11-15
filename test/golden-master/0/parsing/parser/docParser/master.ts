import { MEDIA_RULE_TYPE } from "../../../../../../src/index.types";
import { MediaRuleClone } from "../../../../../../src/parsing/serialization/docClone";
import { Master } from "../../../../../parsing/parser/docParser/index.types";
import { docClone } from "../../serialization/docCloner/docClone";
import { batchedDoc } from "./batchedDoc/batchedDoc";

const master: Master = {
  inputDocClone: docClone,
  batchedDoc: batchedDoc,
  breakpoints: [375, 600],
  globalBaselineWidth: 375,
  baselineWidths: [375, 375, 375],
  baselineMediaQueries: [
    docClone.sheets[0].rules.find(
      (rule) => rule.type === MEDIA_RULE_TYPE
    ) as MediaRuleClone,
    undefined,
    undefined,
  ],
  index: 0,
  step: 0,
};

export { master };
