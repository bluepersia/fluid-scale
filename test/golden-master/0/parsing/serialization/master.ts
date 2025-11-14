import type { DocClonerMaster } from "../../../../parsing/serialization/docCloner/index.types";
import { docClone } from "./docClone/docClone";
const docClonerMaster: DocClonerMaster = {
  index: 0,
  step: 0,
  docClone,
};

export { docClonerMaster };
