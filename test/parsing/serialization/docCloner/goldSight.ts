import type { ExpectStatic } from "vitest";

let expect: ExpectStatic;
if (process.env.NODE_ENV === "test") {
  expect = (await import("vitest")).expect;
}

import AssertionMaster, { type AssertionChainForFunc } from "gold-sight";
import type { DocClonerMaster, GoldSightState } from "./index.types";
import {
  cloneDoc,
  wrap,
} from "../../../../src/parsing/serialization/docCloner";

const cloneDocAssertionChain: AssertionChainForFunc<
  GoldSightState,
  typeof cloneDoc
> = {
  "should clone the document": (state, args, result) => {
    expect(result).toEqual(state.master!.docClone);
  },
};

const defaultAssertions = {
  cloneDoc: cloneDocAssertionChain,
};

class DocClonerAssertionMaster extends AssertionMaster<
  GoldSightState,
  DocClonerMaster
> {
  constructor() {
    super(defaultAssertions, "cloneDoc", {});
  }
  newState(): GoldSightState {
    return {
      sheetIndex: 0,
      rulesIndex: 0,
      ruleIndex: 0,
      styleRuleIndex: 0,
      mediaRuleIndex: 0,
    };
  }

  cloneDoc = this.wrapTopFn(cloneDoc, "cloneDoc");
}
const assertionMaster = new DocClonerAssertionMaster();

function wrapAll() {
  wrap(assertionMaster.cloneDoc);
}

export { DocClonerAssertionMaster, wrapAll };
