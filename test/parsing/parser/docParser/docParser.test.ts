import { describe, test, expect } from "vitest";
import { collection } from "./collection";
import { assertionMaster } from "./goldSight";
import { parseDoc } from "../../../../src/parsing/parser/docParser";
describe("docParser", () => {
  test.each(collection)("should parse the document", (master) => {
    assertionMaster.master = master;
    const result = parseDoc(master.inputDocClone);
    expect(result).toEqual({ breakpoints: master.breakpoints });
  });
});
