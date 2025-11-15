import { RuleBatch } from "../../../../src/parsing/parser/index.types";
import type {
  DocClone,
  MediaRuleClone,
} from "../../../../src/parsing/serialization/docClone";
import type { Master } from "../../../index.types";
import { BatchedDoc } from "./batchedDoc";

type State = {
  master?: DocParserMaster;
  styleRuleIndex: number;
  mediaRuleIndex: number;
  sheetIndex: number;
};

type DocParserMaster = Master & {
  inputDocClone: DocClone;
  batchedDoc: BatchedDoc;
  breakpoints: number[];
  globalBaselineWidth: number;
  baselineWidths: number[];
  baselineMediaQueries: (MediaRuleClone | undefined)[];
};

export type { State, DocParserMaster as Master };
