import type { ExpectStatic } from "vitest";

let expect: ExpectStatic;
if (process.env.NODE_ENV === "test") {
  expect = (await import("vitest")).expect;
}

import AssertionMaster, {
  AssertionChain,
  type AssertionChainForFunc,
} from "gold-sight";
import type { Master, State } from "./index.types";
import {
  cloneDoc,
  cloneStyleRule,
  cloneStyleSheets,
  isStyleSheetAccessible,
  wrap,
} from "../../../../src/parsing/serialization/docCloner";
import { findStyleRule } from "./controller";

const cloneDocAssertionChain: AssertionChainForFunc<State, typeof cloneDoc> = {
  "should clone the document": (state, args, result) => {
    expect(result).toEqual(state.master!.docClone);
  },
};

const isStyleSheetAccessibleAssertionChain: AssertionChain<
  State,
  { selectorText: string },
  boolean
> = {
  "should check if the style sheet is accessible": (state, args, result) => {
    if (args.selectorText === "#accessible") {
      expect(result).toBe(true);
    } else {
      expect(result).toBe(false);
    }
  },
};

const cloneStyleSheetsAssertionChain: AssertionChainForFunc<
  State,
  typeof cloneStyleSheets
> = {
  "should clone the style sheets": (state, args, result) => {
    expect(result).toEqual(state.master!.docClone.sheets);
  },
};

const cloneStyleRuleAssertionChain: AssertionChainForFunc<
  State,
  typeof cloneStyleRule
> = {
  "should clone the style rule": (state, args, result) => {
    expect(result).toEqual(
      findStyleRule(state.master!.docClone, state.styleRuleIndex)
    );
  },
};

const defaultAssertions = {
  cloneDoc: cloneDocAssertionChain,
  isStyleSheetAccessible: isStyleSheetAccessibleAssertionChain,
  cloneStyleSheets: cloneStyleSheetsAssertionChain,
  cloneStyleRule: cloneStyleRuleAssertionChain,
};

class DocClonerAssertionMaster extends AssertionMaster<State, Master> {
  constructor() {
    super(defaultAssertions, "cloneDoc", {});
  }
  newState(): State {
    return {
      sheetIndex: 0,
      rulesIndex: 0,
      ruleIndex: 0,
      styleRuleIndex: 0,
      mediaRuleIndex: 0,
    };
  }

  cloneDoc = this.wrapTopFn(cloneDoc, "cloneDoc");
  isStyleSheetAccessible = this.wrapFn(
    isStyleSheetAccessible,
    "isStyleSheetAccessible",
    {
      getAddress: (state, args, result) => {
        return { sheetIndex: args[1] };
      },
      argsConverter: (args) => {
        try {
          const sheet = args[0] as CSSStyleSheet;
          const firstRule = sheet.cssRules[0] as CSSStyleRule;
          return {
            selectorText: firstRule.selectorText,
          };
        } catch (error) {
          return {
            selectorText: "",
          };
        }
      },
    }
  );
  cloneStyleSheets = this.wrapFn(cloneStyleSheets, "cloneStyleSheets");

  cloneStyleRule = this.wrapFn(cloneStyleRule, "cloneStyleRule", {
    getAddress: (state, args, result) => {
      const mediaWidth = args[1].mediaWidth ? args[1].mediaWidth : "baseline";
      return {
        styleRuleIndex: state.styleRuleIndex,
        selector: args[0].selectorText,
        mediaWidth,
      };
    },
    argsConverter: (args) => {
      return { selectorText: args[0].selectorText };
    },
  });
}
const assertionMaster = new DocClonerAssertionMaster();

function wrapAll() {
  wrap(
    assertionMaster.cloneDoc,
    assertionMaster.isStyleSheetAccessible,
    assertionMaster.cloneStyleSheets,
    assertionMaster.cloneStyleRule
  );
}

export { assertionMaster, wrapAll };
