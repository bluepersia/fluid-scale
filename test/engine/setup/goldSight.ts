import type { ExpectStatic } from "vitest";
import { SetupMaster, State } from "./index.types";

let expect: ExpectStatic;
if (process.env.NODE_ENV === "test") {
  expect = (await import("vitest")).expect;
}
import { addElements } from "../../../src/engine/engine";
import { init, wrapSetup } from "../../../src/main";
import AssertionMaster, {
  AssertionChain,
  AssertionChainForFunc,
} from "gold-sight";
import { SerializedElement } from "../index.types";
import { DocStruct, writeSerializedElementsToDocStruct } from "./docStruct";
import { serializeElStates } from "../serializer";

const initAssertionChain: AssertionChainForFunc<State, typeof init> = {
  "should initialize the engine": (state, args, result) => {},
};

const addElementsAssertionChain: AssertionChain<
  State,
  [],
  SerializedElement[]
> = {
  "should add the elements": (state, args, result) => {
    const docStruct = new DocStruct(state.master!.docStruct.global);
    writeSerializedElementsToDocStruct(docStruct, result);
    expect(docStruct.struct).toEqual(state.master!.docStruct.struct);
  },
};

const defaultAssertions = {
  init: initAssertionChain,
  addElements: addElementsAssertionChain,
};

class SetupAssertionMaster extends AssertionMaster<State, SetupMaster> {
  constructor() {
    super(defaultAssertions, "engineSetup", {});
  }

  newState(): State {
    return {};
  }

  init = this.wrapTopFn(init, "init");

  addElements = this.wrapFn(addElements, "addElements", {
    resultConverter: (result) => {
      return serializeElStates(result);
    },
  });
}

const setupAssertionMaster = new SetupAssertionMaster();

function wrapAll() {
  wrapSetup(setupAssertionMaster.init, setupAssertionMaster.addElements);
}

export { setupAssertionMaster, wrapAll };
