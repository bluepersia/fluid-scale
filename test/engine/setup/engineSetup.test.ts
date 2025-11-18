import { afterAll, beforeAll, describe, test } from "vitest";
import { collection } from "./collection";
import { setupAssertionMaster } from "./goldSight";
import { initPlaywrightPages, teardownPlaywrightPages } from "../../setup";
import { PlaywrightPage } from "../../index.types";
import { AssertionBlueprint } from "gold-sight";
import { assertionMaster as docClonerAssertionMaster } from "../../parsing/serialization/docCloner/goldSight";
import { assertionMaster as docParserAssertionMaster } from "../../parsing/parser/docParser/goldSight";
let playwrightPages: PlaywrightPage[] = [];
beforeAll(async () => {
  playwrightPages = await initPlaywrightPages();
});

afterAll(async () => {
  await teardownPlaywrightPages(playwrightPages);
});

describe("engineSetup", () => {
  test.each(collection)("should setup the engine", async (master) => {
    const { index } = master;
    const { page } = playwrightPages[index];
    const queue: [number, AssertionBlueprint][] = await page.evaluate(
      (master) => {
        (window as any).setupAssertionMaster.master = master;
        (window as any).init({
          ...(window as any).makeDefaultGlobal(),
          ...(window as any).makeEventContext(),
        });
        const queue = (window as any).setupAssertionMaster.getQueue();
        return Array.from(queue.entries());
      },
      master
    );

    setupAssertionMaster.setQueueFromArray(queue);
    setupAssertionMaster.assertQueue({ master });
  });
});
