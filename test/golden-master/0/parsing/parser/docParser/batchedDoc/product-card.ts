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

function writeProductCard(batchedDoc: BatchedDoc) {
  const baseBatch: RuleBatch = {
    rules: docClone.sheets[2].rules.filter(
      (rule) => rule.type === STYLE_RULE_TYPE
    ) as StyleRuleClone[],
    width: 375,
    isMedia: false,
  };
  batchedDoc.addBatch(baseBatch);
  const mediaBatch: RuleBatch = {
    rules: (
      docClone.sheets[2].rules.find(
        (rule) => rule.type === MEDIA_RULE_TYPE
      ) as MediaRuleClone
    ).rules as StyleRuleClone[],
    width: 600,
    isMedia: true,
  };
  batchedDoc.addBatch(mediaBatch);
}

export { writeProductCard };
