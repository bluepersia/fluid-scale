import { SetupMaster as Master } from "../../../../engine/setup/index.types";
import { DocStruct } from "../../../../engine/setup/docStruct";
import { makeDefaultGlobal } from "../../../../../src/utils/global";

const master: Master = {
  index: 0,
  docStruct: new DocStruct(makeDefaultGlobal()),
};

export { master };
