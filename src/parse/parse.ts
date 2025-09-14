import {
  DocumentClone,
  MediaRuleClone,
  StyleRuleClone,
  StyleSheetClone,
} from "./cloner.types";
import { FluidData } from "./index.types";
import {
  DocStateResult,
  ParseCSSResult,
  RuleBatch,
  RuleBatchState,
  StyleSheetParams,
  StyleSheetsParams,
} from "./parse.types";
import { processRuleBatches } from "./patcher";

const STYLE_RULE_TYPE = 1;
const MEDIA_RULE_TYPE = 4;

export { STYLE_RULE_TYPE, MEDIA_RULE_TYPE };

function parseCSS(doc: DocumentClone): ParseCSSResult {
  const { breakpoints, globalBaselineWidth } = prepareDocument(doc);

  let fluidData: FluidData = {};
  let order = 0;

  const { newFluidData, newOrder } = parseStyleSheets({
    styleSheets: doc.styleSheets,
    globalBaselineWidth,
    fluidData,
    order,
    breakpoints,
  });

  fluidData = newFluidData;
  order = newOrder;

  return { breakpoints, fluidData };
}

function prepareDocument(doc: DocumentClone): {
  breakpoints: number[];
  globalBaselineWidth: number;
} {
  const breakpointsSet = new Set<number>();
  let globalBaselineWidth = 375;

  for (const styleSheet of doc.styleSheets) {
    for (const rule of styleSheet.cssRules) {
      if (rule.type === MEDIA_RULE_TYPE) {
        const { minWidth, cssRules } = rule as MediaRuleClone;
        breakpointsSet.add(minWidth);
        if (cssRules.length === 0) globalBaselineWidth = minWidth;
      }
    }
  }

  return { breakpoints: Array.from(breakpointsSet), globalBaselineWidth };
}

function parseStyleSheets(params: StyleSheetsParams): DocStateResult {
  const { styleSheets } = params;
  let { fluidData, order } = params;
  for (const styleSheet of styleSheets) {
    const { newFluidData, newOrder } = parseStyleSheet({
      styleSheet,
      ...params,
    });
    fluidData = newFluidData;
    order = newOrder;
  }
  return {
    newFluidData: fluidData,
    newOrder: order,
  };
}

function parseStyleSheet(params: StyleSheetParams): DocStateResult {
  const { styleSheet, globalBaselineWidth } = params;
  let { fluidData, order } = params;

  const baselineWidth = getStylesheetBaselineWidth(
    styleSheet,
    globalBaselineWidth
  );
  const ruleBatches = batchStyleSheet(styleSheet, baselineWidth);
  const { newFluidData, newOrder } = processRuleBatches({
    ruleBatches,
    ...params,
  });
  fluidData = newFluidData;
  order = newOrder;

  return {
    newFluidData: fluidData,
    newOrder: order,
  };
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
