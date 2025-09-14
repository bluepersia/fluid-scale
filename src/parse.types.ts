import { StyleRuleClone } from "./cloner.types";

type ParseCSSResult = {
  breakpoints: number[];
};

type RuleBatch = {
  width: number;
  styleRules: StyleRuleClone[];
  isMediaQuery: boolean;
};

type RuleBatchState = {
  currentStyleRuleBatch: RuleBatch | null;
  ruleBatches: RuleBatch[];
};

export { ParseCSSResult, RuleBatch, RuleBatchState };
