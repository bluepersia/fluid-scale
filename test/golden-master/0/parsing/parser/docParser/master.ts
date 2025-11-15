import { Master } from "../../../../../parsing/parser/docParser/index.types";
import { docClone } from "../../serialization/docCloner/docClone";

const master: Master = {
  inputDocClone: docClone,
  breakpoints: [375, 600],
  index: 0,
  step: 0,
};

export { master };
