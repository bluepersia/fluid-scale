import type { Master } from "../../../../../parsing/serialization/docCloner/index.types";
import { docClone } from "./docClone";
const master: Master = {
  index: 0,
  step: 0,
  docClone,
};

export { master };
