import type { DocClone } from "../../../../src/parsing/serialization/docClone";
import type { Master } from "../../../index.types";

type GoldSightState = {
  master?: DocClonerMaster;
  sheetIndex: number;
  rulesIndex: number;
  ruleIndex: number;
  styleRuleIndex: number;
  mediaRuleIndex: number;
};

type DocClonerMaster = Master & {
  docClone: DocClone;
};

export type { GoldSightState, DocClonerMaster };
