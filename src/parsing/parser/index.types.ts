import type { StyleRuleClone } from "../serialization/docClone";

type DocParserResults = {
  breakpoints: number[];
};

type RuleBatch = {
  rules: StyleRuleClone[];
  width: number;
  isMedia: boolean;
};

type BatchState = {
  currentBatch: RuleBatch | null;
  batches: RuleBatch[];
};
export type { DocParserResults, RuleBatch, BatchState };
