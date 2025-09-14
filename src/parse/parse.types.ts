import { StyleRuleClone, StyleSheetClone } from "./cloner.types";
import { FluidData, FluidRange } from "./index.types";

type ParseCSSResult = {
  breakpoints: number[];
  fluidData: FluidData;
};

type StyleSheetsParams = {
  styleSheets: StyleSheetClone[];
  globalBaselineWidth: number;
  order: number;
  breakpoints: number[];
  fluidData: FluidData;
};

type StyleSheetParams = Pick<
  StyleSheetsParams,
  "globalBaselineWidth" | "order" | "breakpoints" | "fluidData"
> & {
  styleSheet: StyleSheetClone;
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

type DocStateResult = {
  newFluidData: FluidData;
  newOrder: number;
};

type RuleBatchesParams = {
  ruleBatches: RuleBatch[];
  fluidData: FluidData;
  order: number;
  breakpoints: number[];
};

type RuleBatchParams = Pick<
  RuleBatchesParams,
  "fluidData" | "order" | "breakpoints" | "ruleBatches"
> & {
  ruleBatch: RuleBatch;
  batchIndex: number;
};

type SelectorsParams = Pick<
  RuleBatchParams,
  "fluidData" | "order" | "breakpoints" | "batchIndex" | "ruleBatches"
> & {
  rule: StyleRuleClone;
  batchWidth: number;
};

type StyleRuleParams = Pick<
  SelectorsParams,
  | "fluidData"
  | "order"
  | "breakpoints"
  | "batchIndex"
  | "ruleBatches"
  | "rule"
  | "batchWidth"
> & {
  selector: string;
  property: string;
  minValue: string;
};

type MatchingRuleParams = Pick<
  StyleRuleParams,
  | "fluidData"
  | "order"
  | "breakpoints"
  | "batchIndex"
  | "ruleBatches"
  | "rule"
  | "batchWidth"
  | "property"
  | "minValue"
  | "selector"
> & {
  nextRuleBatch: RuleBatch;
  maxValue: string;
};

type NewFluidRangeParams = Pick<
  MatchingRuleParams,
  "minValue" | "maxValue" | "breakpoints" | "batchWidth" | "nextRuleBatch"
>;

type ApplyNewFluidRangeParams = Pick<
  MatchingRuleParams,
  "fluidData" | "selector" | "property" | "order"
> & {
  fluidRange: FluidRange;
};

export {
  ParseCSSResult,
  RuleBatch,
  RuleBatchState,
  DocStateResult,
  RuleBatchesParams,
  RuleBatchParams,
  StyleRuleParams,
  StyleSheetParams,
  StyleSheetsParams,
  SelectorsParams,
  MatchingRuleParams,
  NewFluidRangeParams,
  ApplyNewFluidRangeParams,
};
