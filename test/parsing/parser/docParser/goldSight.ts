import AssertionMaster, { AssertionChainForFunc } from "gold-sight";
import type { ExpectStatic } from "vitest";
import type { Master, State } from "./index.types";
import { parseDoc, wrap } from "../../../../src/parsing/parser/docParser";

let expect: ExpectStatic;
if (process.env.NODE_ENV === "test") {
  expect = (await import("vitest")).expect;
}

const parseDocAssertionChain: AssertionChainForFunc<State, typeof parseDoc> = {
  "should parse the document": (state, args, result) => {
    expect(result.breakpoints).toEqual(state.master!.breakpoints);
    expect(result.batches).toEqual(state.master!.batchedDoc.batches);
  },
};

const defaultAssertions = {
  parseDoc: parseDocAssertionChain,
};

class DocParserAssertionMaster extends AssertionMaster<State, Master> {
  constructor() {
    super(defaultAssertions, "parseDoc", {});
  }
  newState(): State {
    return {};
  }

  parseDoc = this.wrapTopFn(parseDoc, "parseDoc");
}

const assertionMaster = new DocParserAssertionMaster();

function wrapAll() {
  wrap(assertionMaster.parseDoc);
}

export { assertionMaster, wrapAll };
