import { describe, test, expect } from "vitest";
import { parseCSS } from "../src/parse";
import { documentFixtures } from "./golden-state/init";

const expectedParsedDocumentBase = [
  {
    breakpoints: [375, 600],
  },
];

const expectedParsedDocument = expectedParsedDocumentBase.map(
  (expectedParsedDocument, index) => {
    return {
      expectedParsedDocument,
      index,
    };
  }
);

describe("parseCSS", () => {
  test.each(expectedParsedDocument)(
    "should parse the CSS document",
    ({ expectedParsedDocument, index }) => {
      const parsedDocument = parseCSS(documentFixtures[index]);
      expect(parsedDocument).toEqual(expectedParsedDocument);
    }
  );
});
