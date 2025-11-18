import AssertionMaster, {
  AssertionChainForFunc,
  filterEventsByPayload,
  IEvent,
  withEventBus,
  withEventNames,
} from "gold-sight";
import type { ExpectStatic } from "vitest";
import type { Master, State } from "./index.types";
import {
  batchMediaRule,
  batchStyleRule,
  extractBreakpointsAndBaseline,
  createBatches,
  parseDoc,
  wrap,
  resolveBaselineWidth,
  findBaselineMediaQuery,
  processBatches,
  processSelectorInRule,
  processProperty,
} from "../../../../src/parsing/parser/docParser";
import {
  seekAndInsertFluidRange,
  insertFluidRange,
  handleAutoForcedProperty,
  cloneFluidDataAt,
} from "../../../../src/parsing/parser/fluidDataPatcher";
import {
  findMediaBatchInBatchState,
  findMediaBatchInDoc,
  findStyleRuleInBatchState,
  findStyleRuleInDoc,
} from "./controller";
import { toBeEqualDefined } from "../../../utils/vitest";
import {
  AutoForcedPropertyData,
  FluidData,
  RangedPropertyData,
} from "../../../../src/fluidData";

let expect: ExpectStatic;
if (process.env.NODE_ENV === "test") {
  expect = (await import("vitest")).expect;
}

const parseDocAssertionChain: AssertionChainForFunc<State, typeof parseDoc> = {
  "should parse the document": (state, args, result) => {
    expect(result.breakpoints).toEqual(state.master!.breakpoints);
    result.fluidData = stripOrderID(result.fluidData);
    expect(result.fluidData).toEqual(state.master!.fluidData);
  },
};

function stripOrderID(fluidData: FluidData): FluidData {
  const clone = structuredClone(fluidData);

  for (const anchor of Object.values(clone.anchors)) {
    for (const selector of Object.values(anchor.selectors)) {
      for (const property of Object.values(selector.properties)) {
        property.metaData.orderID = -1;
      }
    }
  }
  return clone;
}

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

const resolveBaselineWidthAssertionChain: AssertionChainForFunc<
  State,
  typeof resolveBaselineWidth
> = {
  "should resolve the baseline width": (state, args, result) => {
    expect(result).toEqual(state.master!.baselineWidths[state.sheetIndex]);
  },
};

const findBaselineMediaQueryAssertionChain: AssertionChainForFunc<
  State,
  typeof findBaselineMediaQuery
> = {
  "should find the baseline media query": (state, args, result) => {
    expect(result).toEqual(
      state.master!.baselineMediaQueries[state.sheetIndex - 1]
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
  "should batch the media rule": (state, args, result) =>
    withEventNames(args, ["batchMediaRule", "omitMediaRule"], (events) => {
      expect(Object.keys(events).length).toBe(1);
      if (events.batchMediaRule) {
        const masterBatch = findMediaBatchInDoc(
          state.master!.batchedDoc,
          state.mediaRuleIndex
        );
        const resultBatch = findMediaBatchInBatchState(
          result,
          state.mediaRuleIndex
        );
        toBeEqualDefined(resultBatch, masterBatch);
      } else if (events.omitMediaRule) {
        expect(result).toBe(args[1]);
      } else {
        throw new Error("Unexpected event");
      }
    }),
};

const createBatchesAssertionChain: AssertionChainForFunc<
  State,
  typeof createBatches
> = {
  "should create the batches": (state, args, result) => {
    expect(result).toEqual(state.master!.batchedDoc.batches);
  },
};

const processBatchesAssertionChain: AssertionChainForFunc<
  State,
  typeof processBatches
> = {
  "should process the batches": (state, args, result) => {
    result = stripOrderID(result);
    expect(result).toEqual(state.master!.fluidData);
  },
};

function assertFluidDataInsertion(
  event: IEvent,
  fluidData: FluidData,
  master: FluidData
) {
  const { anchor, selector, property, type } = event.payload;

  const propertyData =
    fluidData.anchors[anchor].selectors[selector].properties[property];

  if (type === "range") {
    const { rangeIndex } = event.payload;

    toBeEqualDefined(
      (propertyData as RangedPropertyData).ranges[rangeIndex],
      (
        master.anchors[anchor].selectors[selector].properties[
          property
        ] as RangedPropertyData
      ).ranges[rangeIndex]
    );
  } else if (type === "forced") {
    toBeEqualDefined(
      (propertyData as AutoForcedPropertyData).value,
      (
        master.anchors[anchor].selectors[selector].properties[
          property
        ] as AutoForcedPropertyData
      ).value
    );
  }

  expect(propertyData.metaData.orderID).toBe(event.payload.rule.orderID);
  return true;
}

const processSelectorInRuleAssertionChain: AssertionChainForFunc<
  State,
  typeof processSelectorInRule
> = {
  "should process the selector in the rule": (
    state,
    args,
    result,
    assertions
  ) =>
    withEventBus(args, (eventBus) => {
      const [selector, rule] = args;
      const insertionEvents = filterEventsByPayload(
        eventBus,
        "insertFluidData",
        { selector, rule }
      );

      for (const event of insertionEvents) {
        assertFluidDataInsertion(event, result, state.master!.fluidData);
      }

      for (const property of Object.keys(rule.style)) {
        const matchingAssertions = assertions.filter(
          (assertion) =>
            assertion.name === "processProperty" &&
            assertion.args[0] === property &&
            assertion.args[1] === rule &&
            assertion.args[2].selector === selector
        );
        expect(matchingAssertions.length).toBe(1);
      }
    }),
};

const processPropertyAssertionChain: AssertionChainForFunc<
  State,
  typeof processProperty
> = {
  "should process the property": (state, args, result) =>
    withEventNames(
      args,
      ["insertFluidData", "omitFluidDataInsertion"],
      (events) => {
        expect(Object.keys(events).length).toBe(1);
        if (events.insertFluidData) {
          assertFluidDataInsertion(
            events.insertFluidData,
            result,
            state.master!.fluidData
          );
        } else if (events.omitFluidDataInsertion) {
          expect(result).toBe(args[2].fluidData);
        } else {
          throw new Error("Unexpected event");
        }
      }
    ),
};

const seekAndInsertFluidRangeAssertionChain: AssertionChainForFunc<
  State,
  typeof seekAndInsertFluidRange
> = {
  "should seek and insert the fluid range": (state, args, result) =>
    withEventNames(
      args,
      ["insertFluidData", "omitFluidDataInsertion"],
      (events) => {
        expect(Object.keys(events).length).toBe(1);

        if (events.insertFluidData) {
          assertFluidDataInsertion(
            events.insertFluidData,
            result.newFluidData,
            state.master!.fluidData
          );
          expect(result.didMatch).toBe(true);
        } else if (events.omitFluidDataInsertion) {
          expect(result.newFluidData).toBe(args[2].fluidData);
          expect(result.didMatch).toBe(false);
        } else {
          throw new Error("Unexpected event");
        }
      },
      {
        includeOverwritten: true,
      }
    ),
};

const insertFluidRangeAssertionChain: AssertionChainForFunc<
  State,
  typeof insertFluidRange
> = {
  "should insert the fluid range": (state, args, result) =>
    withEventNames(args, ["insertFluidData"], (events) => {
      expect(Object.keys(events).length).toBe(1);
      if (events.insertFluidData) {
        assertFluidDataInsertion(
          events.insertFluidData,
          result,
          state.master!.fluidData
        );
      } else {
        throw new Error("Unexpected event");
      }
    }),
};

const handleAutoForcedPropertyAssertionChain: AssertionChainForFunc<
  State,
  typeof handleAutoForcedProperty
> = {
  "should handle the auto forced property": (state, args, result) =>
    withEventNames(
      args,
      ["insertFluidData", "omitFluidDataInsertion"],
      (events) => {
        expect(Object.keys(events).length).toBe(1);
        if (events.insertFluidData) {
          assertFluidDataInsertion(
            events.insertFluidData,
            result,
            state.master!.fluidData
          );
        } else if (events.omitFluidDataInsertion) {
          expect(result).toBe(args[0]);
        } else {
          throw new Error("Unexpected event");
        }
      }
    ),
};

const cloneFluidDataAtAssertionChain: AssertionChainForFunc<
  State,
  typeof cloneFluidDataAt
> = {
  "should clone the fluid data at the anchor and selector": (
    state,
    args,
    result
  ) => {
    const [fluidData, anchor, selector, property] = args;
    expect(result.anchors[anchor].selectors[selector]).not.toBe(
      fluidData.anchors?.[anchor]?.selectors?.[selector]
    );
    if (result.anchors[anchor].selectors[selector].properties[property]) {
      expect(
        result.anchors[anchor].selectors[selector].properties[property]
      ).not.toBe(
        fluidData.anchors?.[anchor]?.selectors?.[selector]?.properties?.[
          property
        ]
      );
    }
  },
};
const defaultAssertions = {
  parseDoc: parseDocAssertionChain,
  extractBreakpointsAndBaseline: extractBreakpointsAndBaselineAssertionChain,
  batchStyleRule: batchStyleRuleAssertionChain,
  batchMediaRule: batchMediaRuleAssertionChain,
  createBatches: createBatchesAssertionChain,
  resolveBaselineWidth: resolveBaselineWidthAssertionChain,
  findBaselineMediaQuery: findBaselineMediaQueryAssertionChain,
  processBatches: processBatchesAssertionChain,
  processSelectorInRule: processSelectorInRuleAssertionChain,
  processProperty: processPropertyAssertionChain,
  seekAndInsertFluidRange: seekAndInsertFluidRangeAssertionChain,
  insertFluidRange: insertFluidRangeAssertionChain,
  handleAutoForcedProperty: handleAutoForcedPropertyAssertionChain,
  cloneFluidDataAt: cloneFluidDataAtAssertionChain,
};

class DocParserAssertionMaster extends AssertionMaster<State, Master> {
  constructor() {
    super(defaultAssertions, "parseDoc", {});
  }
  newState(): State {
    return {
      styleRuleIndex: 0,
      mediaRuleIndex: 0,
      sheetIndex: 0,
    };
  }

  parseDoc = this.wrapTopFn(parseDoc, "parseDoc");

  extractBreakpointsAndBaseline = this.wrapFn(
    extractBreakpointsAndBaseline,
    "extractBreakpointsAndBaseline"
  );

  resolveBaselineWidth = this.wrapFn(
    resolveBaselineWidth,
    "resolveBaselineWidth",
    {
      getAddress: (state, args, result) => {
        return {
          sheetIndex: state.sheetIndex,
        };
      },
      post: (state) => state.sheetIndex++,
    }
  );

  findBaselineMediaQuery = this.wrapFn(
    findBaselineMediaQuery,
    "findBaselineMediaQuery",
    {
      getAddress: (state, args, result) => {
        return {
          sheetIndex: state.sheetIndex - 1,
        };
      },
    }
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
    getAddress: (state, args) => {
      return {
        mediaRuleIndex: state.mediaRuleIndex,
        width: args[0].minWidth,
      };
    },
    post: (state, args) =>
      withEventNames(args, ["batchMediaRule"], (events) => {
        if (events.batchMediaRule) {
          state.mediaRuleIndex++;
        }
      }),
  });

  createBatches = this.wrapFn(createBatches, "createBatches");

  processBatches = this.wrapFn(processBatches, "processBatches");

  processSelectorInRule = this.wrapFn(
    processSelectorInRule,
    "processSelectorInRule",
    {
      getAddress: (state, args) => {
        return {
          selector: args[0],
          width: args[2].width,
        };
      },
    }
  );

  processProperty = this.wrapFn(processProperty, "processProperty", {
    getAddress: (state, args) => {
      return {
        selector: args[1].selector,
        property: args[0],
        width: args[2].width,
      };
    },
  });

  seekAndInsertFluidRange = this.wrapFn(
    seekAndInsertFluidRange,
    "seekAndInsertFluidRange",
    {
      getAddress: (state, args) => {
        return {
          selector: args[2].selector,
          property: args[0],
          minValue: args[1],
          width: args[2].width,
        };
      },
    }
  );

  insertFluidRange = this.wrapFn(insertFluidRange, "insertFluidRange", {
    getAddress: (state, args) => {
      return {
        selector: args[1].selector,
        property: args[1].property,
        minValue: args[1].minValue,
        maxValue: args[1].nextValue,
        width: args[1].width,
        nextWidth: args[1].nextBatch.width,
      };
    },
  });

  handleAutoForcedProperty = this.wrapFn(
    handleAutoForcedProperty,
    "handleAutoForcedProperty",
    {
      getAddress: (state, args) => {
        return {
          selector: args[1].selector,
          property: args[1].property,
          value: args[1].minValue,
          width: args[1].width,
        };
      },
    }
  );

  cloneFluidDataAt = this.wrapFn(cloneFluidDataAt, "cloneFluidDataAt", {
    deepClone: {
      result: true,
    },
    getAddress: (state, args) => {
      return {
        anchor: args[1],
        selector: args[2],
        property: args[3],
      };
    },
  });
}

const assertionMaster = new DocParserAssertionMaster();

function wrapAll() {
  wrap(
    assertionMaster.parseDoc,
    assertionMaster.extractBreakpointsAndBaseline,
    assertionMaster.batchStyleRule,
    assertionMaster.batchMediaRule,
    assertionMaster.createBatches,
    assertionMaster.resolveBaselineWidth,
    assertionMaster.findBaselineMediaQuery,
    assertionMaster.processBatches,
    assertionMaster.processSelectorInRule,
    assertionMaster.processProperty,
    assertionMaster.seekAndInsertFluidRange,
    assertionMaster.insertFluidRange,
    assertionMaster.handleAutoForcedProperty,
    assertionMaster.cloneFluidDataAt
  );
}

export { assertionMaster, wrapAll };
