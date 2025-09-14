import { cloneDocument } from "../parse/cloner";
import {
  FluidData,
  FluidPropertyMetaData,
  FluidRange,
} from "../parse/index.types";
import { parseCSS } from "../parse/parse";
import {
  AppliedFluidPropertyState,
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
    windowWidth: 400,
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
  state: FluidPropertyState;

  constructor(
    el: HTMLElement,
    metaData: FluidPropertyMetaData,
    fluidRanges: FluidRange[]
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

    this.state.order = this.metaData.order;
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

  const { windowWidth } = getState();
  if (Math.abs(applied.windowWidth - windowWidth) < 1) return true;

  return false;
}
