import { DocStruct } from "../../../../engine/setup/docStruct";
import { makeDefaultGlobal } from "../../../../../src/utils/global";
import { writeProductCard } from "./product-card";

const docStruct = new DocStruct(makeDefaultGlobal());

writeProductCard(docStruct);

export { docStruct };
