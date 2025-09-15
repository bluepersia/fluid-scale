import {
  getBoundingClientRect,
  getComputedStyle,
  updateElement,
} from "./instance/engine";

function calcEmValue(value: number, el: HTMLElement, property: string): number {
  if (property === "font-size") {
    const parent = el.parentElement || document.documentElement;
    return value * parseFloat(getComputedStyle(parent).fontSize);
  } else {
    return value * parseFloat(getComputedStyle(el).fontSize);
  }
}

function calcPercentValue(
  value: number,
  el: HTMLElement,
  property: string
): number {
  const parent = el.parentElement || document.documentElement;

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
      return calcHorizontalPercentValue(value, el);

    case "background-position-y":
      return calcVerticalPercentValue(value, el);

    case "font-size":
      return calcFontSizePercentValue(value, parent);

    case "line-height":
      return calcLineHeightPercentValue(value, el);
  }
  throw new Error(`Unknown percentage property: ${property}`);
}

function calcHorizontalPercentValue(
  value: number,
  parent: HTMLElement
): number {
  updateElement(parent);
  const parentRect = getBoundingClientRect(parent);
  const parentStyle = getComputedStyle(parent);
  const [paddingLeft, paddingRight] = [
    parseFloat(parentStyle.paddingLeft),
    parseFloat(parentStyle.paddingRight),
  ];
  const parentWidth = parentRect.width - paddingLeft - paddingRight;
  return (value / 100) * parentWidth;
}

function calcVerticalPercentValue(value: number, parent: HTMLElement): number {
  updateElement(parent);
  const parentRect = getBoundingClientRect(parent);
  const parentStyle = getComputedStyle(parent);
  const [paddingTop, paddingBottom] = [
    parseFloat(parentStyle.paddingTop),
    parseFloat(parentStyle.paddingBottom),
  ];
  const parentHeight = parentRect.height - paddingTop - paddingBottom;
  return (value / 100) * parentHeight;
}

function calcFontSizePercentValue(value: number, parent: HTMLElement): number {
  const parentStyle = getComputedStyle(parent);
  const parentFontSize = parseFloat(parentStyle.fontSize);
  return (value / 100) * parentFontSize;
}

function calcLineHeightPercentValue(value: number, el: HTMLElement): number {
  const elStyle = getComputedStyle(el);
  const elFontSize = parseFloat(elStyle.fontSize);
  return (value / 100) * elFontSize;
}

export { calcPercentValue, calcEmValue };
