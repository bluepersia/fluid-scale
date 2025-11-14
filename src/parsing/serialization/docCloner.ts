import { MEDIA_RULE_TYPE, STYLE_RULE_TYPE } from "../../index.types";
import { splitBySpaces } from "../../utils/stringHelpers";
import {
  DocClone,
  MediaRuleClone,
  RuleClone,
  SheetClone,
  StyleRuleClone,
} from "./docClone";
import {
  FLUID_PROPERTY_NAMES,
  SHORTHAND_PROPERTIES,
  SPECIAL_PROPERTIES,
} from "./docClonerConsts";
import type {
  CloneDocContext,
  CloneRulesContext,
  ProcessStylePropertyContext,
  ProcessStylePropertyResult,
} from "./index.types";

let cloneDoc = (doc: Document, ctx: CloneDocContext) => {
  ctx.counter = { orderID: -1 };

  const docClone = new DocClone(ctx);

  const accessibleStyleSheets = Array.from(doc.styleSheets).filter(
    isStyleSheetAccessible
  );

  docClone.sheets = cloneStyleSheets(accessibleStyleSheets, ctx);

  return docClone;
};

let isStyleSheetAccessible = (
  sheet: CSSStyleSheet,
  _index: number
): boolean => {
  try {
    const rules = sheet.cssRules;
    return rules ? true : false;
  } catch (error) {
    return false;
  }
};

let cloneStyleSheets = (
  sheets: CSSStyleSheet[],
  ctx: CloneDocContext
): SheetClone[] => {
  const result: SheetClone[] = [];
  for (const sheet of sheets) {
    const sheetClone = new SheetClone(ctx);
    sheetClone.rules = cloneRules(sheet.cssRules, ctx);
    result.push(sheetClone);
  }
  return result;
};

function cloneRules(rules: CSSRuleList, ctx: CloneRulesContext): RuleClone[] {
  const result: RuleClone[] = [];

  for (const rule of rules) {
    if (rule.type === STYLE_RULE_TYPE) {
      const styleRuleClone = cloneStyleRule(rule as CSSStyleRule, ctx);
      if (styleRuleClone) {
        result.push(styleRuleClone);
      }
    } else if (rule.type === MEDIA_RULE_TYPE) {
      const mediaRuleClone = cloneMediaRule(rule as CSSMediaRule, ctx);
      if (mediaRuleClone) {
        result.push(mediaRuleClone);
      }
    }
  }
  return result.filter((rule) => rule !== null);
}

let cloneStyleRule = (
  styleRule: CSSStyleRule,
  ctx: CloneRulesContext
): StyleRuleClone | null => {
  const { event } = ctx;
  const styleRuleClone = new StyleRuleClone(ctx);
  styleRuleClone.selector = normalizeSelector(styleRule.selectorText);

  let propsResult: ProcessStylePropertyResult = {
    style: {},
    specialProps: {},
  };
  for (let i = 0; i < styleRule.style.length; i++) {
    const property = styleRule.style[i];
    const value = styleRule.style.getPropertyValue(property);
    propsResult = processStyleProperty(property, value, {
      ...ctx,
      propsResult,
    });
  }
  styleRuleClone.style = propsResult.style;
  styleRuleClone.specialProps = propsResult.specialProps;
  if (
    Object.keys(styleRuleClone.style).length > 0 ||
    Object.keys(styleRuleClone.specialProps).length > 0
  ) {
    ctx.counter!.orderID++;
    styleRuleClone.orderID = ctx.counter!.orderID;

    if (dev) {
      event?.emit("cloneStyleRule", ctx, { styleRuleClone });
    }
    return styleRuleClone;
  }
  if (dev) {
    event?.emit("omitStyleRule", ctx, { why: "noProps" });
  }
  return null;
};

let processStyleProperty = (
  property: string,
  value: string,
  ctx: ProcessStylePropertyContext
): ProcessStylePropertyResult => {
  const { propsResult, event } = ctx;
  if (FLUID_PROPERTY_NAMES.has(property)) {
    if (SHORTHAND_PROPERTIES.hasOwnProperty(property)) {
      const shorthand = SHORTHAND_PROPERTIES[property];
      const values = splitBySpaces(value);
      const valueCount = values.length;
      const valueMap = shorthand.get(valueCount);
      if (valueMap) {
        const style: Record<string, string> = { ...propsResult.style };
        for (const [index, properties] of valueMap.entries()) {
          for (const property of properties) {
            style[property] = normalizeZero(values[index]);
          }
        }
        if (dev) {
          event?.emit("expandShorthand", ctx, { property, value });
        }
        return { ...propsResult, style };
      }
    } else {
      const style: Record<string, string> = { ...propsResult.style };
      style[property] = normalizeZero(value);
      if (dev) {
        event?.emit("cloneStyleProp", ctx, { property, value });
      }
      return { ...propsResult, style };
    }
  } else if (SPECIAL_PROPERTIES.has(property)) {
    const specialProps: Record<string, string> = {
      ...propsResult.specialProps,
    };
    specialProps[property] = value;
    if (dev) {
      event?.emit("cloneSpecialProp", ctx, { property, value });
    }
    return { ...propsResult, specialProps };
  }
  if (dev) {
    event?.emit("omitStyleProp", ctx, { why: "notFluidOrSpecial" });
  }
  return propsResult;
};

function normalizeZero(input: string): string {
  return input.replace(
    /(?<![\d.])0+(?:\.0+)?(?![\d.])(?!(px|em|rem|%|vh|vw|vmin|vmax|ch|ex|cm|mm|in|pt|pc)\b)/g,
    "0px"
  );
}

function normalizeSelector(selector: string): string {
  return selector
    .replace(/\*::(before|after)\b/g, "::$1")
    .replace(/\s*,\s*/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
}

let cloneMediaRule = (
  mediaRule: CSSMediaRule,
  ctx: CloneRulesContext
): MediaRuleClone | null => {
  const { event } = ctx;
  const mediaRuleClone = new MediaRuleClone(ctx);

  const match = mediaRule.media.mediaText.match(/\(min-width:\s*(\d+)px\)/);

  if (match) {
    const width: number = Number(match[1]);
    mediaRuleClone.minWidth = width;
    mediaRuleClone.rules = cloneRules(mediaRule.cssRules, {
      ...ctx,
      mediaWidth: width,
    }) as StyleRuleClone[];
    if (dev) {
      event?.emit("cloneMediaRule", ctx, { mediaRuleClone });
    }
    return mediaRuleClone;
  }
  if (dev) {
    event?.emit("omitMediaRule", ctx, { why: "noMinWidth" });
  }
  return null;
};

function wrap(
  cloneDocWrapped: typeof cloneDoc,
  isStyleSheetAccessibleWrapped: typeof isStyleSheetAccessible,
  cloneStyleSheetsWrapped: typeof cloneStyleSheets,
  cloneStyleRuleWrapped: typeof cloneStyleRule,
  cloneMediaRuleWrapped: typeof cloneMediaRule,
  processStylePropertyWrapped: typeof processStyleProperty
) {
  cloneDoc = cloneDocWrapped;
  isStyleSheetAccessible = isStyleSheetAccessibleWrapped;
  cloneStyleSheets = cloneStyleSheetsWrapped;
  cloneStyleRule = cloneStyleRuleWrapped;
  cloneMediaRule = cloneMediaRuleWrapped;
  processStyleProperty = processStylePropertyWrapped;
}

export {
  cloneDoc,
  isStyleSheetAccessible,
  cloneStyleSheets,
  wrap,
  cloneStyleRule,
  cloneMediaRule,
  processStyleProperty,
};
