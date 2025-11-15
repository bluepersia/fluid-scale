import AssertionMaster, { AssertionChainForFunc } from "gold-sight";
import type { ExpectStatic } from "vitest";
import type { Master, State } from "./index.types";
import {
  batchMediaRule,
  batchStyleRule,
  extractBreakpointsAndBaseline,
  createBatches,
  parseDoc,
  wrap,
} from "../../../../src/parsing/parser/docParser";
import {
  findMediaBatchInBatchState,
  findMediaBatchInDoc,
  findStyleRuleInBatchState,
  findStyleRuleInDoc,
} from "./controller";

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

const extractBreakpointsAndBaselineAssertionChain: AssertionChainForFunc<
  State,
  typeof extractBreakpointsAndBaseline
> = {
  "should extract the breakpoints and baseline": (state, args, result) => {
    expect(result.breakpoints).toEqual(state.master!.breakpoints);
    expect(result.globalBaselineWidth).toEqual(
      state.master!.globalBaselineWidth
    );
  },
};

const batchStyleRuleAssertionChain: AssertionChainForFunc<
  State,
  typeof batchStyleRule
> = {
  "should batch the style rule": (state, args, result) => {
    expect(result.currentBatch).toBe(result.batches[result.batches.length - 1]);
    const masterRule = findStyleRuleInDoc(
      state.master!.batchedDoc,
      state.styleRuleIndex
    );
    const resultRule = findStyleRuleInBatchState(result, state.styleRuleIndex);
    expect(resultRule).toEqual(masterRule);
  },
};

const batchMediaRuleAssertionChain: AssertionChainForFunc<
  State,
  typeof batchMediaRule
> = {
  "should batch the media rule": (state, args, result) => {
    const masterBatch = findMediaBatchInDoc(
      state.master!.batchedDoc,
      state.mediaRuleIndex
    );
    const resultBatch = findMediaBatchInBatchState(
      result,
      state.mediaRuleIndex
    );
    expect(resultBatch).toEqual(masterBatch);
  },
};

const createBatchesAssertionChain: AssertionChainForFunc<
  State,
  typeof createBatches
> = {
  "should create the batches": (state, args, result) => {
    expect(result).toEqual(state.master!.batchedDoc.batches);
  },
};

const defaultAssertions = {
  parseDoc: parseDocAssertionChain,
  extractBreakpointsAndBaseline: extractBreakpointsAndBaselineAssertionChain,
  batchStyleRule: batchStyleRuleAssertionChain,
  batchMediaRule: batchMediaRuleAssertionChain,
  createBatches: createBatchesAssertionChain,
};

class DocParserAssertionMaster extends AssertionMaster<State, Master> {
  constructor() {
    super(defaultAssertions, "parseDoc", {});
  }
  newState(): State {
    return {
      styleRuleIndex: 0,
      mediaRuleIndex: 0,
    };
  }

  parseDoc = this.wrapTopFn(parseDoc, "parseDoc");

  extractBreakpointsAndBaseline = this.wrapFn(
    extractBreakpointsAndBaseline,
    "extractBreakpointsAndBaseline"
  );

  batchStyleRule = this.wrapFn(batchStyleRule, "batchStyleRule", {
    getAddress: (state, args) => {
      return {
        styleRuleIndex: state.styleRuleIndex,
        selector: args[0].selector,
      };
    },
    post: (state) => state.styleRuleIndex++,
  });

  batchMediaRule = this.wrapFn(batchMediaRule, "batchMediaRule", {
    post: (state) => state.mediaRuleIndex++,
  });

  createBatches = this.wrapFn(createBatches, "createBatches");
}

const assertionMaster = new DocParserAssertionMaster();

function wrapAll() {
  wrap(
    assertionMaster.parseDoc,
    assertionMaster.extractBreakpointsAndBaseline,
    assertionMaster.batchStyleRule,
    assertionMaster.batchMediaRule,
    assertionMaster.createBatches
  );
}

export { assertionMaster, wrapAll };
