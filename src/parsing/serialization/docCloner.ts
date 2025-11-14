import { MEDIA_RULE_TYPE, STYLE_RULE_TYPE } from "../../index.types";
import {
  DocClone,
  MediaQueryClone,
  SheetClone,
  StyleRuleClone,
} from "./docClone";
import { FLUID_PROPERTY_NAMES, SPECIAL_PROPERTIES } from "./docClonerConsts";
import type { CloneDocContext } from "./index.types";

function cloneDoc(doc: Document, ctx: CloneDocContext) {
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
    docClone.sheets.push(sheetClone);
    const rules = sheet.cssRules;
    for (const rule of rules) {
      if (rule.type === STYLE_RULE_TYPE) {
        const styleRule = rule as CSSStyleRule;
        const styleRuleClone = new StyleRuleClone(ctx);
        styleRuleClone.selectorText = styleRule.selectorText;

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
          sheetClone.rules.push(styleRuleClone);
        }
      } else if (rule.type === MEDIA_RULE_TYPE) {
        const mediaRule = rule as CSSMediaRule;
        const mediaRuleClone = new MediaQueryClone(ctx);

        const match = mediaRule.media.mediaText.match(
          /\(min-width:\s*(\d+)px\)/
        );

        if (match) {
          const width: number = Number(match[1]);
          mediaRuleClone.minWidth = width;
          sheetClone.rules.push(mediaRuleClone);
        }
      }
    }
  }
  return docClone;
}

export { cloneDoc };
