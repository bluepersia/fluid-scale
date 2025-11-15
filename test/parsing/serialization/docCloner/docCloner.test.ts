import { describe, test, beforeAll, afterAll, expect } from "vitest";
import {
  initPlaywrightPages,
  JSDOMDocs,
  teardownPlaywrightPages,
} from "../../../setup";
import { collection } from "./collection.ts";
import type { PlaywrightPage } from "../../../index.types";
import { type AssertionBlueprint } from "gold-sight";
import { makeEventContext } from "gold-sight";
import { assertionMaster } from "./goldSight";
import {
  cloneDoc,
  shouldIncludeStyleRule,
} from "../../../../src/parsing/serialization/docCloner";
import { makeDefaultGlobal } from "../../../../src/utils/global";
import { StyleRuleClone } from "../../../../src/parsing/serialization/docClone.ts";

let playwrightPages: PlaywrightPage[] = [];
beforeAll(async () => {
  playwrightPages = await initPlaywrightPages();
});

afterAll(async () => {
  await teardownPlaywrightPages(playwrightPages);
});

describe("docCloner", () => {
  test.each(collection)("should clone the document", async (master) => {
    const { index } = master;
    const { page } = playwrightPages[index];
    const queue: [number, AssertionBlueprint][] = await page.evaluate(
      (master) => {
        (window as any).docClonerAssertionMaster.master = master;
        (window as any).cloneDoc(document, {
          ...(window as any).makeDefaultGlobal(),
          ...(window as any).makeEventContext(),
          isBrowser: true,
        });
        const queue = (window as any).docClonerAssertionMaster.getQueue();
        return Array.from(queue.entries());
      },
      master
    );

    assertionMaster.setQueueFromArray(queue);
    assertionMaster.assertQueue({ master });
  });

  test.each(collection)(
    "should clone the document with JSDOM",
    async (master) => {
      const { index } = master;
      const { doc } = JSDOMDocs[index];

      assertionMaster.master = master;
      cloneDoc(doc, {
        ...makeDefaultGlobal(),
        ...makeEventContext(),
        isBrowser: false,
      });

      assertionMaster.assertQueue();
    }
  );

  describe("shouldIncludeStyleRule", () => {
    test("should return true if the style rule has style properties", () => {
      const styleRuleClone = new StyleRuleClone({});
      styleRuleClone.style = { "padding-top": "10px" };
      expect(shouldIncludeStyleRule(styleRuleClone)).toBe(true);
    });

    test("should return true if the style rule has special properties", () => {
      const styleRuleClone = new StyleRuleClone({});
      styleRuleClone.specialProps = { "padding-top": "10px" };
      expect(shouldIncludeStyleRule(styleRuleClone)).toBe(true);
    });

    test("should return false if the style rule has no properties", () => {
      const styleRuleClone = new StyleRuleClone({});
      expect(shouldIncludeStyleRule(styleRuleClone)).toBe(false);
    });
  });
});
