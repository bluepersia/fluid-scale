import { ElementBundle, ElementWithState } from "./engine.types";
import { getBoundingClientRect } from "./instance/engine";

function readPropertyStateValue(elWState: ElementWithState, property: string) {
  return parseFloat(
    elWState.state?.fluidStates.get(property)?.value ||
      getComputedStyle(elWState.el).getPropertyValue(property)
  );
}

function calcEmValue(
  value: number,
  elBundle: ElementBundle,
  property: string
): number {
  if (property === "font-size") {
    return value * readPropertyStateValue(elBundle.parent, "font-size");
  } else {
    return value * readPropertyStateValue(elBundle.el, "font-size");
  }
}

function calcPercentValue(
  value: number,
  elBundle: ElementBundle,
  property: string
): number {
  const parent = elBundle.parent;

  switch (property) {
    case "width":
    case "left":
    case "right":
    case "margin-left":
    case "margin-right":
    case "padding-left":
    case "padding-right":
    case "border-left-width":
    case "border-right-width":
      return calcHorizontalPercentValue(value, parent);

    case "height":
    case "top":
    case "bottom":
    case "margin-top":
    case "margin-bottom":
    case "padding-top":
    case "padding-bottom":
    case "border-top-width":
    case "border-bottom-width":
      return calcVerticalPercentValue(value, parent);

    case "background-position-x":
      return calcHorizontalPercentValue(value, elBundle.el);

    case "background-position-y":
      return calcVerticalPercentValue(value, elBundle.el);

    case "font-size":
      return calcFontSizePercentValue(value, parent);

    case "line-height":
      return calcLineHeightPercentValue(value, elBundle.el);
  }
  throw new Error(`Unknown percentage property: ${property}`);
}

function calcHorizontalPercentValue(
  value: number,
  parent: ElementWithState
): number {
  const parentRect = getBoundingClientRect(parent.el);
  const [paddingLeft, paddingRight] = [
    readPropertyStateValue(parent, "padding-left"),
    readPropertyStateValue(parent, "padding-right"),
  ];
  const parentWidth = parentRect.width - paddingLeft - paddingRight;
  return (value / 100) * parentWidth;
}

function calcVerticalPercentValue(
  value: number,
  parent: ElementWithState
): number {
  const parentRect = getBoundingClientRect(parent.el);
  const [paddingTop, paddingBottom] = [
    readPropertyStateValue(parent, "padding-top"),
    readPropertyStateValue(parent, "padding-bottom"),
  ];
  const parentHeight = parentRect.height - paddingTop - paddingBottom;
  return (value / 100) * parentHeight;
}

function calcFontSizePercentValue(
  value: number,
  parent: ElementWithState
): number {
  const parentFontSize = readPropertyStateValue(parent, "font-size");
  return (value / 100) * parentFontSize;
}

function calcLineHeightPercentValue(
  value: number,
  el: ElementWithState
): number {
  const elFontSize = readPropertyStateValue(el, "font-size");
  return (value / 100) * elFontSize;
}

export { calcPercentValue, calcEmValue };
