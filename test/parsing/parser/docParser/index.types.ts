import type { DocClone } from "../../../../src/parsing/serialization/docClone";
import type { Master } from "../../../index.types";

type State = {
  master?: DocParserMaster;
};

type DocParserMaster = Master & {
  inputDocClone: DocClone;
  breakpoints: number[];
};

export type { State, DocParserMaster as Master };
