import { DocClone } from "../../../../../../src/parsing/serialization/docClone";
import { makeDefaultGlobal } from "../../../../../../src/utils/global";

import { writeGlobal } from "./global";
import { writeProductCard } from "./product-card";
import { writeUtils } from "./utils";

const docClone = new DocClone(makeDefaultGlobal());

writeGlobal(docClone);
writeUtils(docClone);
writeProductCard(docClone);

export { docClone };
