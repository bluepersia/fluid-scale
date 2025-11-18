import { FluidData } from "../../fluidData";
import { type FluidValue, type FluidValueSingle } from "../../index.types";
import { splitBySpaces } from "../../utils/stringHelpers";
import { splitSelector } from "./docParser";

import type {
  HandleAutoForcedPropertyContext,
  InsertFluidRangeContext,
  RuleBatch,
  SeekAndInsertFluidRangeContext,
} from "./index.types";

let seekAndInsertFluidRange = (
  property: string,
  minValue: string,
  ctx: SeekAndInsertFluidRangeContext
): { didMatch: boolean; newFluidData: FluidData } => {
  const { selector, batches, batchIndex, rule, seekAlg, event } = ctx;
  let { fluidData } = ctx;
  let mediaSeen = false;
  seekMaxLoop: for (const nextBatch of batches.slice(batchIndex + 1)) {
    if (shouldStopSeeking(nextBatch, mediaSeen, seekAlg)) {
      break seekMaxLoop;
    }
    if (nextBatch.isMedia) {
      mediaSeen = true;
    }
    for (const nextRule of nextBatch.rules) {
      if (!splitSelector(nextRule.selector).includes(selector)) {
        continue;
      }
      const nextValue = nextRule.style[property];
      if (nextValue) {
        fluidData = insertFluidRange(fluidData, {
          ...ctx,
          property,
          rule,
          nextValue,
          nextBatch,
          minValue,
        });
        return { didMatch: true, newFluidData: fluidData };
      }
    }
  }
  if (dev)
    event?.emit("omitFluidDataInsertion", ctx, {
      selector,
      property,
      rule,
      why: "noMatch",
    });
  return { didMatch: false, newFluidData: fluidData };
};

function shouldStopSeeking(
  nextBatch: RuleBatch,
  mediaSeen: boolean,
  seekAlg: string
): boolean {
  if (!nextBatch.isMedia) {
    if (
      seekAlg === "stopAt1stNonMedia" ||
      (seekAlg === "stopAfterMedia" && mediaSeen)
    ) {
      return true;
    }
  }
  return false;
}

let insertFluidRange = (fluidData: FluidData, ctx: InsertFluidRangeContext) => {
  const { selector, property, rule, nextValue, width } = ctx;
  const { nextBatch, minValue, event } = ctx;
  const anchor = extractAnchor(selector);
  fluidData = cloneFluidDataAt(fluidData, anchor, selector, property);
  const propertyData =
    fluidData.anchors[anchor].selectors[selector].addRangedProperty(property);
  propertyData.ranges.push({
    minBp: width,
    maxBp: nextBatch.width,
    minValue: parseFluidValue2D(minValue),
    maxValue: parseFluidValue2D(nextValue),
  });
  propertyData.metaData.orderID = rule.orderID;
  if (dev)
    event?.emit("insertFluidData", ctx, {
      type: "range",
      rule,
      anchor,
      selector,
      property,
      rangeIndex: propertyData.ranges.length - 1,
      propertyData,
      width,
    });
  return fluidData;
};

let cloneFluidDataAt = (
  fluidData: FluidData,
  anchor: string,
  selector: string,
  property: string
): FluidData => {
  const newFluidData = new FluidData(fluidData.global);
  newFluidData.anchors = { ...fluidData.anchors };

  if (newFluidData.anchors[anchor]) {
    const anchorData = (newFluidData.anchors[anchor] =
      newFluidData.anchors[anchor].clone());

    if (anchorData.selectors[selector]) {
      const selectorData = (anchorData.selectors[selector] =
        anchorData.selectors[selector].clone());

      if (selectorData.properties[property])
        selectorData.properties[property] =
          selectorData.properties[property].clone();
    }
  }

  const anchorData = newFluidData.addAnchor(anchor);
  anchorData.addSelector(selector);

  return newFluidData;
};

let handleAutoForcedProperty = (
  fluidData: FluidData,
  ctx: HandleAutoForcedPropertyContext
) => {
  const { selector, property, rule, minValue, event } = ctx;
  const anchor = extractAnchor(selector);
  if (fluidData.anchors[anchor]?.selectors[selector]?.properties[property]) {
    if (dev)
      event?.emitOne(
        "omitFluidDataInsertion",
        ctx,
        {
          selector,
          property,
          rule,
        },
        { why: "propertyAlreadyExists" }
      );
    return fluidData;
  }
  fluidData = cloneFluidDataAt(fluidData, anchor, selector, property);

  const propertyData =
    fluidData.anchors[anchor].selectors[selector].addAutoForcedProperty(
      property
    );
  propertyData.value = minValue;
  propertyData.metaData.orderID = rule.orderID;
  if (dev)
    event?.emitOne(
      "insertFluidData",
      ctx,
      {
        selector,
        property,
        rule,
      },
      {
        type: "forced",
        anchor,
        propertyData,
      }
    );
  return fluidData;
};

function extractAnchor(selector: string) {
  const selectorParts = selector.split(" ");
  return selectorParts[selectorParts.length - 1];
}

function parseFluidValue2D(value: string): FluidValue[][] {
  let depth = 0;
  let currentValue = "";
  let values: FluidValue[][] = [];
  for (const char of value) {
    if (char === "(") {
      depth++;
    } else if (char === ")") {
      depth--;
    } else if (char === "," && depth === 0) {
      values.push(parseFluidValue1D(currentValue.trim()));
      currentValue = "";
    } else {
      currentValue += char;
    }
  }
  values.push(parseFluidValue1D(currentValue.trim()));

  return values;
}

function parseFluidValue1D(value: string): FluidValue[] {
  const values: string[] = splitBySpaces(value);
  return values.map((value) => parseFluidValue(value));
}

function parseFluidValue(strValue: string): FluidValue {
  const value = parseFloat(strValue);

  // Match any alphabetic characters after the number
  const match = strValue.match(/[a-z%]+$/i);
  const unit = match?.[0] || "";

  return {
    value,
    unit,
    type: "single",
  } as FluidValueSingle;
}

function wrap(
  seekAndInsertFluidRangeWrapped: typeof seekAndInsertFluidRange,
  insertFluidRangeWrapped: typeof insertFluidRange,
  cloneFluidDataAtWrapped: typeof cloneFluidDataAt,
  handleAutoForcedPropertyWrapped: typeof handleAutoForcedProperty
) {
  seekAndInsertFluidRange = seekAndInsertFluidRangeWrapped;
  insertFluidRange = insertFluidRangeWrapped;
  cloneFluidDataAt = cloneFluidDataAtWrapped;
  handleAutoForcedProperty = handleAutoForcedPropertyWrapped;
}

export {
  seekAndInsertFluidRange,
  insertFluidRange,
  cloneFluidDataAt,
  handleAutoForcedProperty,
  shouldStopSeeking,
  wrap,
};
