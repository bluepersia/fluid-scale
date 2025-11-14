import type { ExpectStatic } from "vitest";

let expect: ExpectStatic;
if (process.env.NODE_ENV === "test") {
  expect = (await import("vitest")).expect;
}

import AssertionMaster, {
  AssertionChain,
  withEventNames,
  type AssertionChainForFunc,
} from "gold-sight";
import type { Master, State } from "./index.types";
import {
  cloneDoc,
  cloneMediaRule,
  cloneStyleRule,
  cloneStyleSheets,
  isStyleSheetAccessible,
  processStyleProperty,
  wrap,
} from "../../../../src/parsing/serialization/docCloner";
import { findMediaRule, findStyleRule } from "./controller";
import { EXPLICIT_PROPS_FOR_SHORTHAND } from "../../../../src/parsing/serialization/docClonerConsts";

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
  "should clone the style rule": (state, args, result) =>
    withEventNames(args, ["cloneStyleRule", "omitStyleRule"], (events) => {
      if (events.cloneStyleRule) {
        expect(result).toEqual(
          findStyleRule(state.master!.docClone, state.styleRuleIndex)
        );
      } else if (events.omitStyleRule) {
        expect(result).toBeNull();
      } else {
        throw new Error("Unexpected event");
      }
    }),
};

function assertShorthandExpansion(
  resultStyle: Record<string, string>,
  masterStyle: Record<string, string>,
  property: string
) {
  for (const explicitProp of EXPLICIT_PROPS_FOR_SHORTHAND.get(property)!) {
    expect(resultStyle[explicitProp]).toBe(masterStyle[explicitProp]);
  }
}

const processStylePropertyAssertionChain: AssertionChainForFunc<
  State,
  typeof processStyleProperty
> = {
  "should clone the style property": (state, args, result) =>
    withEventNames(
      args,
      [
        "cloneStyleProp",
        "expandShorthand",
        "cloneSpecialProp",
        "omitStyleProp",
      ],
      (events) => {
        const [property, value, ctx] = args;
        const masterRule = findStyleRule(
          state.master!.docClone,
          state.styleRuleIndex - 1
        )!;
        if (events.cloneStyleProp) {
          expect(result.style[property]).toBe(masterRule.style[property]);
        } else if (events.expandShorthand) {
          assertShorthandExpansion(result.style, masterRule.style, property);
        } else if (events.cloneSpecialProp) {
          expect(result.specialProps[property]).toBe(
            masterRule.specialProps[property]
          );
        } else if (events.omitStyleProp) {
          expect(result).toBe(ctx.propsResult);
        } else {
          throw new Error("Unexpected event");
        }
      }
    ),
};

const cloneMediaRuleAssertionChain: AssertionChainForFunc<
  State,
  typeof cloneMediaRule
> = {
  "should clone the media rule": (state, args, result) =>
    withEventNames(args, ["cloneMediaRule", "omitMediaRule"], (events) => {
      if (events.cloneMediaRule) {
        expect(result).toEqual(
          findMediaRule(state.master!.docClone, state.mediaRuleIndex)
        );
      } else if (events.omitMediaRule) {
        expect(result).toBeNull();
      } else {
        throw new Error("Unexpected event");
      }
    }),
};
const defaultAssertions = {
  cloneDoc: cloneDocAssertionChain,
  isStyleSheetAccessible: isStyleSheetAccessibleAssertionChain,
  cloneStyleSheets: cloneStyleSheetsAssertionChain,
  cloneStyleRule: cloneStyleRuleAssertionChain,
  processStyleProperty: processStylePropertyAssertionChain,
  cloneMediaRule: cloneMediaRuleAssertionChain,
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
    post: (state, args, result) =>
      withEventNames(args, ["cloneStyleRule", "omitStyleRule"], (events) => {
        if (events.cloneStyleRule) state.styleRuleIndex++;
      }),
  });
  processStyleProperty = this.wrapFn(
    processStyleProperty,
    "processStyleProperty"
  );
  cloneMediaRule = this.wrapFn(cloneMediaRule, "cloneMediaRule", {
    getAddress: (state, args, result) => {
      return {
        mediaRuleIndex: state.mediaRuleIndex,
        mediaText: args[0].media.mediaText,
      };
    },
    post: (state, args, result) =>
      withEventNames(args, ["cloneMediaRule", "omitMediaRule"], (events) => {
        if (events.cloneMediaRule) state.mediaRuleIndex++;
      }),
  });
}
const assertionMaster = new DocClonerAssertionMaster();

function wrapAll() {
  wrap(
    assertionMaster.cloneDoc,
    assertionMaster.isStyleSheetAccessible,
    assertionMaster.cloneStyleSheets,
    assertionMaster.cloneStyleRule,
    assertionMaster.cloneMediaRule,
    assertionMaster.processStyleProperty
  );
}

export { assertionMaster, wrapAll };
