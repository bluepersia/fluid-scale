import { MEDIA_RULE_TYPE, STYLE_RULE_TYPE } from "../../../../src/index.types";
import {
  DocClone,
  MediaRuleClone,
  StyleRuleClone,
} from "../../../../src/parsing/serialization/docClone";
import { AbsCounter } from "gold-sight";

function findStyleRule(docClone: DocClone, index: number) {
  const counter = new AbsCounter(index);

  for (const sheet of docClone.sheets) {
    for (const rule of sheet.rules) {
      if (rule.type === STYLE_RULE_TYPE) {
        if (counter.match()) return rule as StyleRuleClone;
      } else if (rule.type === MEDIA_RULE_TYPE) {
        for (const childRule of (rule as MediaRuleClone).rules) {
          if (counter.match()) return childRule as StyleRuleClone;
        }
      }
    }
  }
  return null;
}

function findMediaRule(docClone: DocClone, index: number) {
  const counter = new AbsCounter(index);

  for (const sheet of docClone.sheets) {
    for (const rule of sheet.rules) {
      if (rule.type === MEDIA_RULE_TYPE) {
        if (counter.match()) return rule as MediaRuleClone;
      }
    }
  }
  return null;
}

export { findStyleRule, findMediaRule };
