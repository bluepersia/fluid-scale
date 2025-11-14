import { describe, it, test, expect } from "vitest";

import {
  generateJSDOMDocument,
  resolvePath,
} from "../../src/parsing/jsdom/jsonBuilder";
import path from "path";

const resolvePathTests = [
  {
    cssPath: "./css/global.css",
    htmlFilePath: "test/golden-master/0/index.html",
    expected: "css/global.css",
  },
  {
    cssPath: "css/utils.css",
    htmlFilePath: "test/golden-master/0/index.html",
    expected: "css/utils.css",
  },
  {
    cssPath:
      "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap",
    htmlFilePath: "test/golden-master/0/index.html",
    expected: null,
  },
];

describe("resolvePath", () => {
  test.each(resolvePathTests)(
    "should resolve the path",
    ({ cssPath, htmlFilePath, expected }) => {
      const finalExpected = expected
        ? path.resolve(path.dirname(htmlFilePath), expected)
        : null;
      expect(resolvePath(cssPath, htmlFilePath)).toBe(finalExpected);
    }
  );
});

describe("generateJSDOMDocument", () => {
  it("should generate a JSDOM document", () => {
    const document = generateJSDOMDocument(["test/golden-master/0/index.html"]);
    expect(document).toBeDefined();
    expect(document.styleSheets).toHaveLength(3);
    expect(document.styleSheets[0].cssRules).toHaveLength(6);
    expect(document.styleSheets[1].cssRules).toHaveLength(1);
    expect(document.styleSheets[2].cssRules).toHaveLength(14);
  });
});
