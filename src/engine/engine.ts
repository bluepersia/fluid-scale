import { cloneDocument } from "../parse/cloner";
import {
  FluidData,
  FluidPropertyMetaData,
  FluidRange,
} from "../parse/index.types";
import { parseCSS } from "../parse/parse";
import { GlobalState, IFluidProperty } from "./engine.types";

const state: GlobalState = {
  breakpoints: [],
  fluidData: {},
  allElements: new Set(),
  activeElements: new Set(),
  pendingHiddenElements: new Set(),
};

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

function init(): void {
  const doc = cloneDocument(document);
  const { breakpoints, fluidData } = parseCSS(doc);
  initEngineState(breakpoints, fluidData);
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

  for (const [selector, properties] of Object.entries(anchorData)) {
    if (!el.matches(selector)) continue;

    for (const { metaData, fluidRanges } of Object.values(properties)) {
      newFluidProperties.push(new FluidProperty(el, metaData, fluidRanges));
    }
  }

  return newFluidProperties;
}

class FluidProperty implements IFluidProperty {
  el: HTMLElement;
  metaData: FluidPropertyMetaData;
  fluidRanges: FluidRange[];

  constructor(
    el: HTMLElement,
    metaData: FluidPropertyMetaData,
    fluidRanges: FluidRange[]
  ) {
    this.el = el;
    this.metaData = metaData;
    this.fluidRanges = fluidRanges;
  }
}
