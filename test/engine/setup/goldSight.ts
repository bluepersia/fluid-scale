import type { ExpectStatic } from "vitest";
import { SetupMaster, State } from "./index.types";

let expect: ExpectStatic;
if (process.env.NODE_ENV === "test") {
  expect = (await import("vitest")).expect;
}
import {
  addElements,
  getGlobalState,
  insertFluidPropertiesForAnchor,
} from "../../../src/engine/engine";
import { init, wrapSetup } from "../../../src/main";
import AssertionMaster, {
  AssertionChain,
  AssertionChainForFunc,
  filterEventsByPayload,
  filterEventsByUUID,
  withEvents,
} from "gold-sight";
import { SerializedElement } from "../index.types";
import { DocStruct, writeSerializedElementsToDocStruct } from "./docStruct";
import { serializeElStates } from "../serializer";
import {
  filterEventsByName,
  withEventNamesList,
} from "gold-sight/dist/utils/eventBus";
import { FluidProperty } from "../../../src/index.types";
import { AddElementsContext } from "../../../src/engine/index.types";

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

const insertFluidPropertyAssertionChain: AssertionChain<
  State,
  [string, { goldenId: string }, AddElementsContext],
  FluidProperty[]
> = {
  "should insert the fluid property": (state, args, result) =>
    withEventNamesList(
      args,
      ["omitFluidPropertyInsertion", "insertFluidProperty"],
      (events) => {
        const [anchor, el, ctx] = args;
        const masterStruct = state.master!.docStruct.struct;

        for (const event of events.omitFluidPropertyInsertion) {
          const masterProperty = masterStruct[el.goldenId]?.find(
            (fp) => fp.selector === event.payload.selector
          );
          expect(masterProperty).toBeUndefined();

          const resultProperty = result.find(
            (fp) => fp.selector === event.payload.selector
          );
          expect(resultProperty).toBeUndefined();
        }

        for (const event of events.insertFluidProperty) {
          const property = masterStruct[el.goldenId]?.find(
            (fp) =>
              fp.selector === event.payload.selector &&
              fp.property === event.payload.property
          );

          if (property) {
            const resultProperty = result.find(
              (fp) =>
                fp.selector === event.payload.selector &&
                fp.property === event.payload.property
            );
            expect(resultProperty).toEqual(property);
          }
        }
      }
    ),
};

const defaultAssertions = {
  init: initAssertionChain,
  addElements: addElementsAssertionChain,
  insertFluidProperty: insertFluidPropertyAssertionChain,
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

  insertFluidProperty = this.wrapFn(
    insertFluidPropertiesForAnchor,
    "insertFluidProperty",
    {
      argsConverter: (args) => {
        return [args[0], { goldenId: args[1].dataset.goldenId! }, args[2]];
      },
    }
  );
}

const setupAssertionMaster = new SetupAssertionMaster();

function wrapAll() {
  wrapSetup(
    setupAssertionMaster.init,
    setupAssertionMaster.addElements,
    setupAssertionMaster.insertFluidProperty
  );
}

export { setupAssertionMaster, wrapAll };
