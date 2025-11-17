import { Master } from "../../index.types";
import { DocStruct } from "./docStruct";

type State = {
  master?: SetupMaster;
};

type SetupMaster = Master & {
  docStruct: DocStruct;
};

export type { State, SetupMaster };
