import { expect, it, describe } from "vitest";
import { splitBySpaces } from "../../src/utils/stringHelpers";

describe("split by spaces", () => {
  it("should split outer at depth 1", () => {
    expect(splitBySpaces("10px 20px")).toEqual(["10px", "20px"]);
    expect(splitBySpaces("10px 20em 30rem")).toEqual(["10px", "20em", "30rem"]);
  });

  it("should split outer at depth 2", () => {
    expect(splitBySpaces("10px min(20px, 30px)")).toEqual([
      "10px",
      "min(20px, 30px)",
    ]);
    expect(splitBySpaces("10px 20em max(30px, 40px)")).toEqual([
      "10px",
      "20em",
      "max(30px, 40px)",
    ]);
  });
  it("should split outer at depth 3", () => {
    expect(
      splitBySpaces("10px min(max(20rem, 15rem), 30px) max(40px, 50px)")
    ).toEqual(["10px", "min(max(20rem, 15rem), 30px)", "max(40px, 50px)"]);
  });
});
