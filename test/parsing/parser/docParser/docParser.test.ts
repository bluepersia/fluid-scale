import { describe, test, expect } from "vitest";
import { collection } from "./collection";
import { assertionMaster } from "./goldSight";
import {
  cloneFluidDataAt,
  parseDoc,
  shouldStopSeeking,
} from "../../../../src/parsing/parser/docParser";
import { makeDefaultGlobal } from "../../../../src/utils/global";
import { makeEventContext } from "gold-sight";
import { RuleBatch } from "../../../../src/parsing/parser/index.types";
import { FluidData } from "../../../../src/fluidData";
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
