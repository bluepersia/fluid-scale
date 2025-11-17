import { makeDefaultGlobal } from "../../../../../../../src/utils/global";
import { BatchedDoc } from "../../../../../../parsing/parser/docParser/batchedDoc";
import { writeGlobal } from "./global";
import { writeProductCard } from "./product-card";
import { writeUtils } from "./utils";

const batchedDoc: BatchedDoc = new BatchedDoc(makeDefaultGlobal());

writeGlobal(batchedDoc);
writeUtils(batchedDoc);
writeProductCard(batchedDoc);

export { batchedDoc };
