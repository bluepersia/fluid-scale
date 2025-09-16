import { cloneDocument } from "../../parse/cloner";
import { FluidRange } from "../../parse/index.types";
import { parseCSS } from "../../parse/parse";
import {
  ElementBundle,
  ElementState,
  FluidPropertyStateUpdate,
  IFluidProperty,
  ProcessAnchorMatchParams,
} from "../engine.types";
import { FluidProperty } from "../fluidProperty";
import { intersectionObserver } from "./observers";
import {
  removePendingHiddenElement,
  updateCurrentBreakpointIndex,
  updateWindowSize,
  getBoundingClientRect,
  getComputedStyle,
  initEngineState,
  clearCaches,
  getState,
  removeActiveElement,
  deleteElement,
  clearCacheForElement,
  addElement,
  initElementState,
} from "./state";

const PROPERTY_REDIRECTS = new Map<string, string>([
  ["--bg-fluid-size", "background-size"],
]);

function init(): void {
  const doc = cloneDocument(document);
  const { breakpoints, fluidData } = parseCSS(doc);
  initEngineState(breakpoints, fluidData);
}

function update(): void {
  updateWindowSize();
  updateCurrentBreakpointIndex();
  const { pendingHiddenElements, activeElements, windowSize, elementStates } =
    getState();

  for (const el of pendingHiddenElements) {
    updateElement(makeElBundle(el, elementStates), windowSize[0]); //Flushes
  }

  for (const el of activeElements) {
    updateElement(makeElBundle(el, elementStates), windowSize[0]);
  }
  clearCaches();
}

function makeElBundle(
  el: HTMLElement,
  elementStates: Map<HTMLElement, ElementState>
): ElementBundle {
  return {
    el: { el, state: elementStates.get(el)! },
    parent: {
      el: el.parentElement || document.documentElement,
      state: elementStates.get(el.parentElement || document.documentElement)!,
    },
  };
}

function updateElement(elBundle: ElementBundle, windowWidth: number): void {
  const { el, state } = elBundle.el;

  if (!el.isConnected) {
    removeActiveElement(el);
    removePendingHiddenElement(el);
    deleteElement(el);
    intersectionObserver.unobserve(el);
    for (const fluidProperty of state.fluidProperties || []) {
      fluidProperty.destroy();
    }
    return;
  }

  const updatedStates = updateFluidProperties(elBundle, windowWidth);
  state.updateWidth = state.isVisible ? windowWidth : undefined;

  applyUpdatedStates(el, state, Array.from(updatedStates.entries()));
}

function updateFluidProperties(
  elBundle: ElementBundle,
  windowSize: number
): Map<string, FluidPropertyStateUpdate> {
  const updatedStates = new Map<string, FluidPropertyStateUpdate>();
  const { state } = elBundle.el;

  if (state.isVisible) {
    for (const fluidProperty of state.fluidProperties || []) {
      const appliedState = state.fluidStates.get(
        fluidProperty.metaData.property
      );

      if (appliedState && fluidProperty.metaData.order < appliedState.order)
        continue;

      const stateUpdate = fluidProperty.update(
        appliedState,
        windowSize,
        elBundle
      );

      if (stateUpdate) {
        if (appliedState && appliedState.value === stateUpdate.value) continue;
        updatedStates.set(fluidProperty.metaData.property, stateUpdate);
      }
    }
  }

  return updatedStates;
}

function applyUpdatedStates(
  el: HTMLElement,
  elState: ElementState,
  updatedStatesEntries: [string, FluidPropertyStateUpdate][]
) {
  for (const [property, stateUpdate] of updatedStatesEntries) {
    el.style.setProperty(
      PROPERTY_REDIRECTS.get(property) || property,
      stateUpdate.value
    );

    if (stateUpdate.fluidProperty) {
      elState.fluidStates.set(property, stateUpdate);
    }
  }
  if (updatedStatesEntries.length > 0) clearCacheForElement(el);
}

function addElements(elements: HTMLElement[]) {
  const { breakpoints, allElements, fluidData } = getState();
  for (const el of elements) {
    if (allElements.has(el)) continue;
    const elState = initElementState(el);
    const elWState = { el, state: elState };

    const classes = Array.from(el.classList);
    for (const klass of classes) {
      const newFluidProperties = processAnchorMatch({
        el,
        anchor: klass,
        breakpoints,
        fluidData,
      });
      elWState.state.fluidProperties?.push(...newFluidProperties);
    }

    if (el.id) {
      const newFluidProperties = processAnchorMatch({
        el,
        anchor: el.id,
        breakpoints,
        fluidData,
      });
      elWState.state.fluidProperties?.push(...newFluidProperties);
    }

    const newFluidProperties = processAnchorMatch({
      el,
      anchor: el.tagName.toLowerCase(),
      breakpoints,
      fluidData,
    });
    elWState.state.fluidProperties?.push(...newFluidProperties);

    if (elState.fluidProperties!.length <= 0) continue;

    elState.fluidProperties = sortFluidProperties(elState.fluidProperties!);

    addElement(el);
    intersectionObserver.observe(el);
  }
}

function processAnchorMatch(params: ProcessAnchorMatchParams): FluidProperty[] {
  const { el, anchor, breakpoints, fluidData } = params;

  const anchorData = fluidData[anchor];

  if (!anchorData) return [];

  const newFluidProperties: FluidProperty[] = [];

  for (const [selector, properties] of Object.entries(anchorData)) {
    if (!el.matches(selector)) continue;

    for (const { metaData, fluidRanges } of Object.values(properties)) {
      const fluidRangesSorted: (FluidRange | null)[] = breakpoints.map(
        (bp) => fluidRanges.find(({ minIndex }) => bp === minIndex) || null
      );

      newFluidProperties.push(
        new FluidProperty({
          el,
          metaData,
          fluidRanges: fluidRangesSorted,
          elStateCache: new Map(),
        })
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
  PROPERTY_REDIRECTS,
};
