import {
  describe,
  test,
  expect,
  vi,
  beforeEach,
  beforeAll,
  afterAll,
} from "vitest";
import { collection } from "./collection";
import { assertionMaster } from "./goldSight";

import {
  parseDoc,
  setProcessProperty,
  shouldStopSeeking,
} from "../../../../src/parsing/parser/docParser";
import * as docParser from "../../../../src/parsing/parser/docParser";
import { makeDefaultGlobal } from "../../../../src/utils/global";
import { makeEventContext } from "gold-sight";
import {
  ProcessSelectorInRuleContext,
  RuleBatch,
} from "../../../../src/parsing/parser/index.types";
import { FluidData } from "../../../../src/fluidData";
import { StyleRuleClone } from "../../../../src/parsing/serialization/docClone";
describe("docParser", () => {
  test.each(collection)("should parse the document", (master) => {
    assertionMaster.master = master;

    parseDoc(master.inputDocClone, {
      ...makeDefaultGlobal(),
      ...makeEventContext(),
    });

    assertionMaster.assertQueue();
  });
});

describe("shouldStopSeeking", () => {
  test("should return true if the next batch is not a media batch and the seek alg is stopAt1stNonMedia", () => {
    const nextBatch = {
      isMedia: false,
    };
    const mediaSeen = false;
    const seekAlg = "stopAt1stNonMedia";
    const result = shouldStopSeeking(
      nextBatch as RuleBatch,
      mediaSeen,
      seekAlg
    );
    expect(result).toBe(true);
  });

  test("should return true if the next batch is not a media batch, media has been seen and seek alg is stopAfterMedia", () => {
    const nextBatch = {
      isMedia: false,
    };
    const mediaSeen = true;
    const seekAlg = "stopAfterMedia";
    const result = shouldStopSeeking(
      nextBatch as RuleBatch,
      mediaSeen,
      seekAlg
    );
    expect(result).toBe(true);
  });

  test("should return false if the seek alg is fullDoc", () => {
    const nextBatch = {
      isMedia: false,
    };
    const mediaSeen = true;
    const seekAlg = "fullDoc";
    const result = shouldStopSeeking(
      nextBatch as RuleBatch,
      mediaSeen,
      seekAlg
    );
    expect(result).toBe(false);
  });

  test("should return false if the next batch is a media batch and the seek alg is not fullDoc", () => {
    const nextBatch = {
      isMedia: true,
    };
    const mediaSeen = false;
    const seekAlg = "stopAt1stNonMedia";
    const result = shouldStopSeeking(
      nextBatch as RuleBatch,
      mediaSeen,
      seekAlg
    );
    expect(result).toBe(false);
  });

  test("should return false if the next batch is not a media batch, media has not been seen and seek alg is stopAfterMedia", () => {
    const nextBatch = {
      isMedia: false,
    };
    const mediaSeen = false;
    const seekAlg = "stopAfterMedia";
    const result = shouldStopSeeking(
      nextBatch as RuleBatch,
      mediaSeen,
      seekAlg
    );
    expect(result).toBe(false);
  });
});

describe("processSelectorInRule", () => {
  let processPropertyOriginal;
  let spyProcessProperty;
  beforeAll(() => {
    processPropertyOriginal = docParser.processProperty;
    spyProcessProperty = vi.spyOn(docParser, "processProperty");
    setProcessProperty(spyProcessProperty);
  });
  afterAll(() => {
    setProcessProperty(processPropertyOriginal);
  });
  test("should process all the properties in the rule", () => {
    const selector: string = "selector";
    const rule: StyleRuleClone = new StyleRuleClone(makeDefaultGlobal());
    rule.selector = selector;
    rule.style = {
      prop1: "value1",
      prop2: "value2",
      prop3: "value3",
    };
    const ctx: ProcessSelectorInRuleContext = {
      ...makeDefaultGlobal(),
      ...makeEventContext(),
      fluidData: new FluidData(makeDefaultGlobal()),
      batchIndex: 0,
      batches: [],
      width: 0,
    };

    docParser.processSelectorInRule(selector, rule, ctx);

    expect(spyProcessProperty).toHaveBeenCalledTimes(
      Object.keys(rule.style).length
    );
    expect(spyProcessProperty.mock.calls[0][0]).toBe("prop1");
    expect(spyProcessProperty.mock.calls[1][0]).toBe("prop2");
    expect(spyProcessProperty.mock.calls[2][0]).toBe("prop3");
    expect(spyProcessProperty.mock.calls[0][1]).toBe(rule);
    expect(spyProcessProperty.mock.calls[1][1]).toBe(rule);
    expect(spyProcessProperty.mock.calls[2][1]).toBe(rule);
    expect(spyProcessProperty.mock.calls[0][2]).toBeDefined();
    expect(spyProcessProperty.mock.calls[1][2]).toBeDefined();
    expect(spyProcessProperty.mock.calls[2][2]).toBeDefined();
  });
});
