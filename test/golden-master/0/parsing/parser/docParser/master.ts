import { Master } from "../../../../../parsing/parser/docParser/index.types";
import { docClone } from "../../serialization/docCloner/docClone";
import { batchedDoc } from "./batchedDoc/batchedDoc";

const master: Master = {
  inputDocClone: docClone,
  batchedDoc: batchedDoc,
  breakpoints: [375, 600],
  index: 0,
  step: 0,
};

export { master };
