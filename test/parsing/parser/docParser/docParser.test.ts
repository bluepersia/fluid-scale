import { describe, test, expect } from "vitest";
import { collection } from "./collection";
import { assertionMaster } from "./goldSight";
import { parseDoc } from "../../../../src/parsing/parser/docParser";
describe("docParser", () => {
  test.each(collection)("should parse the document", (master) => {
    assertionMaster.master = master;

    parseDoc(master.inputDocClone);

    assertionMaster.assertQueue();
  });
});
