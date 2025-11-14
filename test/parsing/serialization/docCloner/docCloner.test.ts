import { describe, test, beforeAll, afterAll } from "vitest";
import { initPlaywrightPages, teardownPlaywrightPages } from "../../../setup";
import { collection } from "./collection.ts";
import type { PlaywrightPage } from "../../../index.types";
import { type AssertionBlueprint } from "gold-sight";
import { makeEventContext } from "gold-sight";
import { assertionMaster } from "./goldSight";
import { cloneDoc } from "../../../../src/parsing/serialization/docCloner";
import { makeDefaultGlobal } from "../../../../src/utils/global";

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
        });
        const queue = (window as any).docClonerAssertionMaster.getQueue();
        return Array.from(queue.entries());
      },
      master
    );

    assertionMaster.setQueueFromArray(queue);
    assertionMaster.assertQueue({ master });
  });
});
