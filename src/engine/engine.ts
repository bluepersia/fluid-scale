import { cloneDocument } from "../parse/cloner";
import {
  FluidData,
  FluidPropertyMetaData,
  FluidRange,
} from "../parse/index.types";
import { parseCSS } from "../parse/parse";
import {
  AppliedFluidPropertyState,
  ComputationParams,
  ConvertToPxParams,
  FluidPropertyState,
  GlobalState,
  IFluidProperty,
} from "./engine.types";

let state: GlobalState;
resetState();

function resetState() {
  state = {
    breakpoints: [],
    fluidData: {},
    allElements: new Set(),
    activeElements: new Set(),
    pendingHiddenElements: new Set(),
    windowSize: [400, 400],
    currentBreakpointIndex: 0,
  };
}

const intersectionObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      addActiveElement(entry.target as HTMLElement);
      removePendingHiddenElement(entry.target as HTMLElement);
    } else {
      addPendingHiddenElement(entry.target as HTMLElement);
      removeActiveElement(entry.target as HTMLElement);
    }
  }
});

function getState() {
  return { ...state };
}

function initEngineState(breakpoints: number[], fluidData: FluidData) {
  state.breakpoints = breakpoints;
  state.fluidData = fluidData;
}

function addActiveElement(el: HTMLElement) {
  state.activeElements.add(el);
}

function removeActiveElement(el: HTMLElement) {
  state.activeElements.delete(el);
}

function addPendingHiddenElement(el: HTMLElement) {
  state.pendingHiddenElements.add(el);
}

function removePendingHiddenElement(el: HTMLElement) {
  state.pendingHiddenElements.delete(el);
}

function updateCurrentBreakpointIndex(): void {
  const { windowSize } = state;
  const [windowWidth] = windowSize;

  let currentBreakpointIndex = 0;
  for (let i = state.breakpoints.length - 1; i >= 0; i--) {
    const breakpoint = state.breakpoints[i];
    if (windowWidth >= breakpoint) {
      currentBreakpointIndex = i;
      break;
    }
  }

  state.currentBreakpointIndex = currentBreakpointIndex;
}

function updateWindowSize(): void {
  state.windowSize = [window.innerWidth, window.innerHeight];
}

function init(): void {
  const doc = cloneDocument(document);
  const { breakpoints, fluidData } = parseCSS(doc);
  initEngineState(breakpoints, fluidData);
}

function update(): void {
  updateWindowSize();
  updateCurrentBreakpointIndex();
}

function addElements(elements: HTMLElement[]) {
  for (const el of elements) {
    if (state.allElements.has(el)) continue;

    const classes = Array.from(el.classList);
    for (const klass of classes) {
      const newFluidProperties = processAnchorMatch(el, klass);
      el.fluidProperties.push(...newFluidProperties);
    }

    if (el.id) {
      const newFluidProperties = processAnchorMatch(el, el.id);
      el.fluidProperties.push(...newFluidProperties);
    }

    const newFluidProperties = processAnchorMatch(el, el.tagName.toLowerCase());
    el.fluidProperties.push(...newFluidProperties);

    if (el.fluidProperties.length <= 0) continue;

    state.allElements.add(el);
    intersectionObserver.observe(el);
  }
}

function processAnchorMatch(el: HTMLElement, anchor: string): FluidProperty[] {
  const { fluidData } = getState();

  const anchorData = fluidData[anchor];

  if (!anchorData) return [];

  const newFluidProperties: FluidProperty[] = [];

  const { breakpoints } = getState();

  for (const [selector, properties] of Object.entries(anchorData)) {
    if (!el.matches(selector)) continue;

    for (const { metaData, fluidRanges } of Object.values(properties)) {
      const fluidRangesSorted: (FluidRange | null)[] = breakpoints.map(
        (bp) => fluidRanges.find(({ minIndex }) => bp === minIndex) || null
      );

      newFluidProperties.push(
        new FluidProperty(el, metaData, fluidRangesSorted)
      );
    }
  }

  return newFluidProperties;
}

class FluidProperty implements IFluidProperty {
  el: HTMLElement;
  metaData: FluidPropertyMetaData;
  fluidRanges: (FluidRange | null)[];
  state: FluidPropertyState;

  constructor(
    el: HTMLElement,
    metaData: FluidPropertyMetaData,
    fluidRanges: (FluidRange | null)[]
  ) {
    this.el = el;
    this.metaData = metaData;
    this.fluidRanges = fluidRanges;

    if (!el.fluidPropertyStates) {
      el.fluidPropertyStates = {};
    }

    if (!el.fluidPropertyStates[this.metaData.property]) {
      el.fluidPropertyStates[this.metaData.property] = newFluidPropertyState(
        this.metaData.property
      );
    }

    this.state = el.fluidPropertyStates[this.metaData.property];
  }

  update(): void {
    if (isLowerOrder(this.metaData.order, this.state.order)) return;

    if (repeatLastComputedValue(this.state.applied, this.metaData.order)) {
      this.state.value = this.state.applied!.value;
      this.state.fluidProperty = this.state.applied!.fluidProperty;
      return;
    }

    const value = computeValueAsString(
      this.fluidRanges,
      this.el,
      this.metaData.property
    );

    this.state.order = this.metaData.order;
    this.state.value = value;
    this.state.fluidProperty = this;
  }
}

function newFluidPropertyState(property: string): FluidPropertyState {
  return {
    order: -1,
    value: "",
    property,
  };
}
function isLowerOrder(currentOrder: number, otherOrder: number): boolean {
  return currentOrder < otherOrder;
}

function repeatLastComputedValue(
  applied:
    | Omit<AppliedFluidPropertyState, "value" | "fluidProperty">
    | undefined,
  order: number
): boolean {
  if (!applied) return false;

  if (order > applied.order) return false;

  const {
    windowSize: [windowWidth],
  } = getState();
  if (Math.abs(applied.windowWidth - windowWidth) < 1) return true;

  return false;
}

function computeValueAsString(
  fluidRanges: (FluidRange | null)[],
  el: HTMLElement,
  property: string
): string {
  const state = makeComputationParams(fluidRanges, el, property);

  if (!state) return "";

  const value = computeValue(state);

  if (typeof value === "number") return `${value}px`;
  else return value;
}

function makeComputationParams(
  fluidRanges: (FluidRange | null)[],
  el: HTMLElement,
  property: string
): ComputationParams | null {
  const {
    currentBreakpointIndex,
    windowSize: [windowWidth],
    breakpoints,
  } = getState();

  const currentFluidRange = fluidRanges.find(
    (range) =>
      range &&
      currentBreakpointIndex >= range.minIndex &&
      currentBreakpointIndex <= range.maxIndex
  );

  if (!currentFluidRange) return null;

  const minBreakpoint = breakpoints[currentFluidRange.minIndex];
  const maxBreakpoint = breakpoints[currentFluidRange.maxIndex];

  const progress =
    (windowWidth - minBreakpoint) / (maxBreakpoint - minBreakpoint);

  return { ...currentFluidRange, progress, el, property };
}

function computeValue(params: ComputationParams): number {
  const { progress, minValue, maxValue } = params;
  if (progress <= 0)
    return convertToPx({
      value: minValue.value,
      unit: minValue.unit,
      ...params,
    });
  else if (progress >= 1)
    return convertToPx({
      value: maxValue.value,
      unit: maxValue.unit,
      ...params,
    });
  else {
    return interpolateFluidValue(params);
  }
}

function convertToPx(params: ConvertToPxParams): number {
  const { value, unit, el, property } = params;
  const { windowSize } = getState();
  switch (unit) {
    case "px":
      return value;
    case "em": {
      if (property === "font-size") {
        const parent = el.parentElement || document.documentElement;
        return value * parseFloat(getComputedStyle(parent).fontSize);
      } else {
        return value * parseFloat(getComputedStyle(el).fontSize);
      }
    }
    case "rem":
      return (
        value * parseFloat(getComputedStyle(document.documentElement).fontSize)
      );
    case "vw":
      return (value * windowSize[0]) / 100;
    case "vh":
      return (value * windowSize[1]) / 100;
  }
  throw Error(`Unsupported unit ${unit}`);
}

function interpolateFluidValue(params: ComputationParams): number {
  const { minValue, maxValue, progress } = params;
  const minValuePx = convertToPx({
    value: minValue.value,
    unit: minValue.unit,
    ...params,
  });
  const maxValuePx = convertToPx({
    value: maxValue.value,
    unit: maxValue.unit,
    ...params,
  });
  return minValuePx + (maxValuePx - minValuePx) * progress;
}
