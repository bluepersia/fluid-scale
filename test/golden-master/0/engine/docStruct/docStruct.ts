import { DocStruct } from "../../../../engine/docStruct/docStruct";
import { makeDefaultGlobal } from "../../../../../src/utils/global";
import { writeProductCard } from "./product-card";

const docStruct = new DocStruct(makeDefaultGlobal());

writeProductCard(docStruct);

export { docStruct };
