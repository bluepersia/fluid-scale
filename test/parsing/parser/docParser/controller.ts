import { MEDIA_RULE_TYPE, STYLE_RULE_TYPE } from "../../../../src/index.types";
import {
  MediaRuleClone,
  StyleRuleClone,
} from "../../../../src/parsing/serialization/docClone";
import { AbsCounter } from "gold-sight";
import { BatchedDoc } from "./batchedDoc";
import { BatchState } from "../../../../src/parsing/parser/index.types";

function findStyleRuleInDoc(doc: BatchedDoc, index: number) {
  const counter = new AbsCounter(index);

  for (const batch of doc.batches) {
    for (const rule of batch.rules) {
      if (rule.type === STYLE_RULE_TYPE) {
        if (counter.match()) return rule as StyleRuleClone;
      }
    }
  }
  return null;
}

function findStyleRuleInBatchState(batchState: BatchState, index: number) {
  const counter = new AbsCounter(index);

  for (const batch of batchState.batches) {
    for (const rule of batch.rules) {
      if (rule.type === STYLE_RULE_TYPE) {
        if (counter.match()) return rule as StyleRuleClone;
      }
    }
  }
  return null;
}

function findMediaBatchInDoc(doc: BatchedDoc, index: number) {
  const counter = new AbsCounter(index);

  for (const batch of doc.batches) {
    if (batch.isMedia) {
      if (counter.match()) return batch;
    }
  }
  return null;
}

function findMediaBatchInBatchState(batchState: BatchState, index: number) {
  const counter = new AbsCounter(index);

  for (const batch of batchState.batches) {
    if (batch.isMedia) {
      if (counter.match()) return batch;
    }
  }
  return null;
}

export {
  findStyleRuleInDoc,
  findStyleRuleInBatchState,
  findMediaBatchInDoc,
  findMediaBatchInBatchState,
};
