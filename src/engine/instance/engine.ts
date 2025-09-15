import { cloneDocument } from "../../parse/cloner";
import { FluidRange } from "../../parse/index.types";
import { parseCSS } from "../../parse/parse";
import { FluidPropertyStateUpdate, IFluidProperty } from "../engine.types";
import { FluidProperty } from "../fluidProperty";
import { intersectionObserver } from "./observers";
import {
  removePendingHiddenElement,
  updateCurrentBreakpointIndex,
  updateWindowSize,
  updateAppliedState,
  getBoundingClientRect,
  getComputedStyle,
  initEngineState,
  clearCaches,
  getState,
  removeActiveElement,
  deleteElement,
  clearCacheForElement,
  addElement,
} from "./state";

function init(): void {
  const doc = cloneDocument(document);
  const { breakpoints, fluidData } = parseCSS(doc);
  initEngineState(breakpoints, fluidData);
}

function update(): void {
  updateWindowSize();
  updateCurrentBreakpointIndex();
  const { pendingHiddenElements, activeElements } = getState();

  for (const el of pendingHiddenElements) {
    updateElement(el); //Flushes
  }

  for (const el of activeElements) updateElement(el);

  clearCaches();
}

function updateElement(el: HTMLElement): void {
  if (!el.isConnected) {
    removeActiveElement(el);
    removePendingHiddenElement(el);
    deleteElement(el);
    intersectionObserver.unobserve(el);
    for (const fluidProperty of el.fluidProperties || []) {
      fluidProperty.destroy();
    }
    return;
  }

  const updatedStates = updateFluidProperties(el);
  el.updateWidth = el.isVisible ? getState().windowSize[0] : undefined;

  const updatedStatesEntries = Array.from(updatedStates.entries());
  for (const [property, stateUpdate] of updatedStatesEntries) {
    el.style.setProperty(property, stateUpdate.value);

    if (stateUpdate.fluidProperty) {
      updateAppliedState(el, property, stateUpdate);
    }
  }
  if (updatedStatesEntries.length > 0) clearCacheForElement(el);
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

      if (stateUpdate) {
        if (appliedState && appliedState.value === stateUpdate.value) continue;
        updatedStates.set(fluidProperty.metaData.property, stateUpdate);
      }
    }
  }

  return updatedStates;
}

function addElements(elements: HTMLElement[]) {
  for (const el of elements) {
    if (getState().allElements.has(el)) continue;
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

    el.fluidProperties = sortFluidProperties(el.fluidProperties);

    addElement(el);
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

function sortFluidProperties(
  fluidProperties: IFluidProperty[]
): IFluidProperty[] {
  const priorityProps = new Set(["font-size", "line-height"]);

  return fluidProperties.sort((a, b) => {
    // 1. Sort by orderID (descending)
    if (a.metaData.order !== b.metaData.order) {
      return b.metaData.order - a.metaData.order;
    }

    // 2. If same orderID, prioritize font-size / line-height
    const aPriority = priorityProps.has(a.metaData.property);
    const bPriority = priorityProps.has(b.metaData.property);

    if (aPriority && !bPriority) return -1;
    if (bPriority && !aPriority) return 1;

    // 3. Otherwise keep original order
    return 0;
  });
}

export {
  init,
  update,
  addElements,
  getState,
  updateElement,
  getBoundingClientRect,
  getComputedStyle,
};
