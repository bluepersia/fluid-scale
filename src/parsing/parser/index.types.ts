import type { EventContext } from "gold-sight";
import type { Global } from "../../index.types";
import type { StyleRuleClone } from "../serialization/docClone";
import type { FluidData } from "../../fluidData";

type ParseDocContext = Global & EventContext & {};

type ProcessSelectorInRuleContext = ParseDocContext & {
  batchIndex: number;
  batches: RuleBatch[];
  width: number;
  fluidData: FluidData;
};
type ProcessPropertyContext = ProcessSelectorInRuleContext & {
  selector: string;
};

type SeekAndInsertFluidRangeContext = ProcessPropertyContext & {
  rule: StyleRuleClone;
};
type InsertFluidRangeContext = SeekAndInsertFluidRangeContext & {
  property: string;
  nextValue: string;
  nextBatch: RuleBatch;
  minValue: string;
};
type HandleAutoForcedPropertyContext = ProcessPropertyContext & {
  minValue: string;
  property: string;
  rule: StyleRuleClone;
};

type DocParserResults = {
  breakpoints: number[];
  fluidData: FluidData;
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
export type {
  DocParserResults,
  RuleBatch,
  BatchState,
  ParseDocContext,
  ProcessSelectorInRuleContext,
  ProcessPropertyContext,
  SeekAndInsertFluidRangeContext,
  InsertFluidRangeContext,
  HandleAutoForcedPropertyContext,
};
