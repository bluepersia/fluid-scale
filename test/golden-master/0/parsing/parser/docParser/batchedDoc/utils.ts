import {
  MEDIA_RULE_TYPE,
  STYLE_RULE_TYPE,
} from "../../../../../../../src/index.types";
import { RuleBatch } from "../../../../../../../src/parsing/parser/index.types";
import {
  MediaRuleClone,
  StyleRuleClone,
} from "../../../../../../../src/parsing/serialization/docClone";
import { BatchedDoc } from "../../../../../../parsing/parser/docParser/batchedDoc";
import { docClone } from "../../../serialization/docCloner/docClone";

function writeUtils(batchedDoc: BatchedDoc) {
  const baseBatch = batchedDoc.batches[batchedDoc.batches.length - 1];
  baseBatch.rules = [
    ...baseBatch.rules,
    ...(docClone.sheets[1].rules.filter(
      (rule) => rule.type === STYLE_RULE_TYPE
    ) as StyleRuleClone[]),
  ];
}

export { writeUtils };
