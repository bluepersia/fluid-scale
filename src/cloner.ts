import {
  DocumentClone,
  MediaRuleClone,
  StyleRuleClone,
  StyleSheetClone,
} from "./cloner.types";
import { MEDIA_RULE_TYPE, STYLE_RULE_TYPE } from "./parse";

const FLUID_PROPERTY_NAMES = new Set<string>([
  "font-size",
  "line-height",
  "letter-spacing",
  "word-spacing",
  "text-indent",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "border-top-width",
  "border-right-width",
  "border-bottom-width",
  "border-left-width",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-bottom-right-radius",
  "border-bottom-left-radius",
  "width",
  "min-width",
  "max-width",
  "height",
  "min-height",
  "max-height",
  "grid-template-columns",
  "grid-template-rows",
  "background-position-x",
  "background-position-y",
  "--fluid-bg-size",
  "top",
  "left",
  "right",
  "bottom",
  "column-gap",
  "row-gap",
]);

function cloneDocument(doc: Document): DocumentClone {
  const docClone: DocumentClone = {
    styleSheets: [],
  };

  for (const styleSheet of filterAccessibleStyleSheets(doc.styleSheets))
    docClone.styleSheets.push(cloneStyleSheet(styleSheet));

  return docClone;
}

function filterAccessibleStyleSheets(
  styleSheets: StyleSheetList
): CSSStyleSheet[] {
  return Array.from(styleSheets).filter((sheet) => {
    try {
      const rules = sheet.cssRules;
      return rules ? true : false;
    } catch (e) {
      return false;
    }
  });
}

function cloneStyleSheet(styleSheet: CSSStyleSheet): StyleSheetClone {
  const sheetClone: StyleSheetClone = {
    cssRules: [],
  };
  for (const rule of Array.from(styleSheet.cssRules)) {
    if (rule.type === STYLE_RULE_TYPE) {
      sheetClone.cssRules.push(cloneStyleRule(rule as CSSStyleRule));
    } else if (rule.type === MEDIA_RULE_TYPE) {
      const mediaRule = cloneMediaRule(rule as CSSMediaRule);
      if (mediaRule) {
        sheetClone.cssRules.push(mediaRule);
      }
    }
  }
  return sheetClone;
}

function cloneStyleRule(styleRule: CSSStyleRule): StyleRuleClone {
  const style: Record<string, string> = {};
  for (const property of Array.from(styleRule.style)) {
    if (FLUID_PROPERTY_NAMES.has(property)) {
      style[property] = styleRule.style.getPropertyValue(property);
    }
  }
  return {
    type: STYLE_RULE_TYPE,
    selectorText: styleRule.selectorText,
    style,
    specialProperties: {},
  } as StyleRuleClone;
}

function cloneMediaRule(mediaRule: CSSMediaRule): MediaRuleClone | null {
  // Regex explanation: matches (min-width: <number>px)
  const match = mediaRule.media.mediaText.match(/\(min-width:\s*(\d+)px\)/);

  if (match) {
    return {
      type: MEDIA_RULE_TYPE,
      minWidth: Number(match[1]),
      cssRules: Array.from(mediaRule.cssRules).map((rule) =>
        cloneStyleRule(rule as CSSStyleRule)
      ),
    };
  }
  return null;
}
