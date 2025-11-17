import type { ExpectStatic } from "vitest";
import { SetupMaster, State } from "./index.types";

let expect: ExpectStatic;
if (process.env.NODE_ENV === "test") {
  expect = (await import("vitest")).expect;
}
import { addElements, getGlobalState } from "../../../src/engine/engine";
import { init, wrapSetup } from "../../../src/main";
import AssertionMaster, {
  AssertionChain,
  AssertionChainForFunc,
} from "gold-sight";
import { SerializedElement } from "../index.types";
import { DocStruct, writeSerializedElementsToDocStruct } from "./docStruct";
import { serializeElStates } from "../serializer";

const initAssertionChain: AssertionChain<
  State,
  [],
  { allElsKeys: string[]; serializedElState: SerializedElement[] }
> = {
  "should initialize the engine": (state, args, result) => {
    for (const elKey of result.allElsKeys)
      expect(state.master!.docStruct.struct.hasOwnProperty(elKey)).toBe(true);

    const docStruct = new DocStruct(state.master!.docStruct.global);
    writeSerializedElementsToDocStruct(docStruct, result.serializedElState);
    expect(docStruct.struct).toEqual(state.master!.docStruct.struct);
  },
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

  init = this.wrapTopFn(init, "init", {
    resultConverter: () => {
      const { allEls } = getGlobalState();
      const allElsKeys = Array.from(allEls.keys()).map(
        (el) => el.dataset.goldenId!
      );
      const serializedElState = serializeElStates(Array.from(allEls.values()));
      return { allElsKeys, serializedElState };
    },
  });

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
