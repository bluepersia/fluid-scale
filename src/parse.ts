import {
  DocumentClone,
  MediaRuleClone,
  StyleRuleClone,
  StyleSheetClone,
} from "./cloner.types";
import { ParseCSSResult, RuleBatch, RuleBatchState } from "./parse.types";

const STYLE_RULE_TYPE = 1;
const MEDIA_RULE_TYPE = 4;

export { STYLE_RULE_TYPE, MEDIA_RULE_TYPE };

function parseCSS(doc: DocumentClone): ParseCSSResult {
  const breakpoints = new Set<number>();
  let globalBaselineWidth = 375;

  for (const styleSheet of doc.styleSheets) {
    for (const rule of styleSheet.cssRules) {
      if (rule.type === MEDIA_RULE_TYPE) {
        const { minWidth, cssRules } = rule as MediaRuleClone;
        breakpoints.add(minWidth);
        if (cssRules.length === 0) globalBaselineWidth = minWidth;
      }
    }
  }

  parseStyleSheets(doc.styleSheets, globalBaselineWidth);

  return { breakpoints: Array.from(breakpoints) };
}

function parseStyleSheets(
  styleSheets: StyleSheetClone[],
  globalBaselineWidth: number
): void {
  for (const styleSheet of styleSheets) {
    parseStyleSheet(styleSheet, globalBaselineWidth);
  }
}

function parseStyleSheet(
  styleSheet: StyleSheetClone,
  globalBaselineWidth: number
): void {
  const baselineWidth = getStylesheetBaselineWidth(
    styleSheet,
    globalBaselineWidth
  );
  const ruleBatches = batchStyleSheet(styleSheet, baselineWidth);
}

function getStylesheetBaselineWidth(
  styleSheet: StyleSheetClone,
  globalBaselineWidth: number
): number {
  const baselineMediaQuery = styleSheet.cssRules.find(
    (rule) =>
      rule.type === MEDIA_RULE_TYPE &&
      (rule as MediaRuleClone).cssRules.length === 0
  ) as MediaRuleClone;

  return baselineMediaQuery?.minWidth ?? globalBaselineWidth;
}

function batchStyleSheet(
  styleSheet: StyleSheetClone,
  baselineWidth: number
): RuleBatch[] {
  let ruleBatchState: RuleBatchState = {
    currentStyleRuleBatch: null,
    ruleBatches: [],
  };
  for (const rule of styleSheet.cssRules) {
    if (rule.type === STYLE_RULE_TYPE) {
      ruleBatchState = {
        ...ruleBatchState,
        ...batchStyleRule(
          rule as StyleRuleClone,
          ruleBatchState,
          baselineWidth
        ),
      };
    } else if (rule.type === MEDIA_RULE_TYPE) {
      ruleBatchState.ruleBatches.push(
        newMediaRuleBatch(rule as MediaRuleClone)
      );
    }
  }
  return ruleBatchState.ruleBatches;
}

function batchStyleRule(
  styleRule: StyleRuleClone,
  ruleBatchState: RuleBatchState,
  baselineWidth: number
): RuleBatchState {
  const newRuleBatchState: RuleBatchState = { ...ruleBatchState };

  if (newRuleBatchState.currentStyleRuleBatch === null) {
    newRuleBatchState.currentStyleRuleBatch = {
      width: baselineWidth,
      styleRules: [],
      isMediaQuery: false,
    };
    newRuleBatchState.ruleBatches = [
      ...newRuleBatchState.ruleBatches,
      newRuleBatchState.currentStyleRuleBatch,
    ];
  }
  newRuleBatchState.currentStyleRuleBatch = {
    ...newRuleBatchState.currentStyleRuleBatch,
    styleRules: [
      ...newRuleBatchState.currentStyleRuleBatch.styleRules,
      styleRule,
    ],
  };

  return newRuleBatchState;
}

function newMediaRuleBatch(mediaRule: MediaRuleClone): RuleBatch {
  return {
    width: mediaRule.minWidth,
    styleRules: mediaRule.cssRules,
    isMediaQuery: true,
  };
}
