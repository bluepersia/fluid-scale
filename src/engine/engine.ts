import { cloneDocument } from "../parse/cloner";
import { FluidData, FluidRange } from "../parse/index.types";
import { parseCSS } from "../parse/parse";
import { FluidPropertyStateUpdate, GlobalState } from "./engine.types";
import { FluidProperty } from "./fluidProperty";

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
    appliedStates: new Map(),
  };
}

const intersectionObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    const el = entry.target as HTMLElement;
    if (entry.isIntersecting) {
      addActiveElement(el);
      removePendingHiddenElement(el);
      el.isVisible = true;
    } else {
      addPendingHiddenElement(el);
      removeActiveElement(el);
      el.isVisible = false;
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

function updateAppliedState(
  el: HTMLElement,
  property: string,
  stateUpdate: FluidPropertyStateUpdate
): void {
  state.appliedStates.set([el, property], stateUpdate);
}

function init(): void {
  const doc = cloneDocument(document);
  const { breakpoints, fluidData } = parseCSS(doc);
  initEngineState(breakpoints, fluidData);
}

function update(): void {
  updateWindowSize();
  updateCurrentBreakpointIndex();

  for (const el of state.pendingHiddenElements) {
    updateElement(el); //Flushes
  }

  for (const el of state.activeElements) updateElement(el);
}

function updateElement(el: HTMLElement): void {
  if (!el.isConnected) {
    removeActiveElement(el);
    removePendingHiddenElement(el);
    state.allElements.delete(el);
    return;
  }

  const updatedStates = updateFluidProperties(el);
  el.updateWidth = el.isVisible ? getState().windowSize[0] : undefined;

  for (const [property, stateUpdate] of updatedStates.entries()) {
    el.style.setProperty(property, stateUpdate.value);

    if (stateUpdate.fluidProperty) {
      updateAppliedState(el, property, stateUpdate);
    }
  }
}

function updateFluidProperties(
  el: HTMLElement
): Map<string, FluidPropertyStateUpdate> {
  const updatedStates = new Map<string, FluidPropertyStateUpdate>();

  if (el.isVisible) {
    const { appliedStates } = getState();
    for (const fluidProperty of el.fluidProperties || []) {
      const appliedState = appliedStates.get([
        el,
        fluidProperty.metaData.property,
      ]);
      if (appliedState && fluidProperty.metaData.order < appliedState.order)
        continue;

      const stateUpdate = fluidProperty.update(appliedState);
      if (stateUpdate)
        updatedStates.set(fluidProperty.metaData.property, stateUpdate);
    }
  }

  return updatedStates;
}

function addElements(elements: HTMLElement[]) {
  for (const el of elements) {
    if (state.allElements.has(el)) continue;
    el.fluidProperties = [];

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

export { init, update, addElements, getState };
