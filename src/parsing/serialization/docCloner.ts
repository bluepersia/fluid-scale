import { MEDIA_RULE_TYPE, STYLE_RULE_TYPE } from "../../index.types";
import {
  DocClone,
  MediaRuleClone,
  RuleClone,
  SheetClone,
  StyleRuleClone,
} from "./docClone";
import { FLUID_PROPERTY_NAMES, SPECIAL_PROPERTIES } from "./docClonerConsts";
import type { CloneDocContext } from "./index.types";

let cloneDoc = (doc: Document, ctx: CloneDocContext) => {
  ctx.counter = { orderID: -1 };

  const docClone = new DocClone(ctx);

  const accessibleStyleSheets = Array.from(doc.styleSheets).filter((sheet) => {
    try {
      const rules = sheet.cssRules;
      return rules ? true : false;
    } catch (error) {
      return false;
    }
  });

  for (const sheet of accessibleStyleSheets) {
    const sheetClone = new SheetClone(ctx);
    sheetClone.rules = cloneRules(sheet.cssRules, ctx);
    docClone.sheets.push(sheetClone);
  }
  return docClone;
};

function cloneRules(rules: CSSRuleList, ctx: CloneDocContext): RuleClone[] {
  const result: RuleClone[] = [];

  for (const rule of rules) {
    if (rule.type === STYLE_RULE_TYPE) {
      const styleRule = rule as CSSStyleRule;
      const styleRuleClone = new StyleRuleClone(ctx);
      styleRuleClone.selector = styleRule.selectorText;

      for (let i = 0; i < styleRule.style.length; i++) {
        const property = styleRule.style[i];
        if (FLUID_PROPERTY_NAMES.has(property)) {
          styleRuleClone.style[property] =
            styleRule.style.getPropertyValue(property);
        } else if (SPECIAL_PROPERTIES.has(property)) {
          styleRuleClone.specialProps[property] =
            styleRule.style.getPropertyValue(property);
        } else {
          continue;
        }
      }
      if (
        Object.keys(styleRuleClone.style).length > 0 ||
        Object.keys(styleRuleClone.specialProps).length > 0
      ) {
        ctx.counter!.orderID++;
        styleRuleClone.orderID = ctx.counter!.orderID;
        result.push(styleRuleClone);
      }
    } else if (rule.type === MEDIA_RULE_TYPE) {
      const mediaRule = rule as CSSMediaRule;
      const mediaRuleClone = new MediaRuleClone(ctx);

      const match = mediaRule.media.mediaText.match(/\(min-width:\s*(\d+)px\)/);

      if (match) {
        const width: number = Number(match[1]);
        mediaRuleClone.minWidth = width;
        mediaRuleClone.rules = cloneRules(
          mediaRule.cssRules,
          ctx
        ) as StyleRuleClone[];
        result.push(mediaRuleClone);
      }
    }
  }
  return result.filter((rule) => rule !== null);
}

function wrap(cloneDocWrapped: typeof cloneDoc) {
  cloneDoc = cloneDocWrapped;
}

export { cloneDoc, wrap };
