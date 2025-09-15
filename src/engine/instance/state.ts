import { FluidData } from "../../parse/index.types";
import { FluidPropertyStateUpdate, GlobalState } from "../engine.types";

let state: GlobalState;
resetState();

function resetState() {
  state = {
    breakpoints: [],
    fluidData: {},
    allElements: new Set(),
    activeElements: [],
    pendingHiddenElements: new Set(),
    windowSize: [400, 400],
    currentBreakpointIndex: 0,
    appliedStates: new Map(),
    boundClientRects: new Map<HTMLElement, DOMRect>(),
    computedStyles: new Map<HTMLElement, CSSStyleDeclaration>(),
  };
}
function getState() {
  return { ...state };
}

function initEngineState(breakpoints: number[], fluidData: FluidData) {
  state.breakpoints = breakpoints;
  state.fluidData = fluidData;
}

function deleteElement(el: HTMLElement) {
  state.allElements.delete(el);
}

function addElement(el: HTMLElement) {
  state.allElements.add(el);
}

function addActiveElement(el: HTMLElement) {
  state.activeElements.push(el);
}
function removeActiveElement(el: HTMLElement) {
  state.activeElements = state.activeElements.filter((e) => e !== el);
}
function removeActiveElements(removedElements: Set<HTMLElement>) {
  state.activeElements = state.activeElements.filter(
    (e) => !removedElements.has(e)
  );
}

function sortActiveElements() {
  state.activeElements = sortByDOMOrder(state.activeElements);
}

function sortByDOMOrder(elements: HTMLElement[]) {
  return [...elements].sort((a, b) => {
    if (a === b) return 0;
    const position = a.compareDocumentPosition(b);

    if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
      return -1; // a comes before b
    }
    if (position & Node.DOCUMENT_POSITION_PRECEDING) {
      return 1; // a comes after b
    }
    return 0;
  });
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

function getBoundingClientRect(el: HTMLElement): DOMRect {
  const rect = state.boundClientRects.get(el);
  if (rect) return rect;
  const newRect = el.getBoundingClientRect();
  state.boundClientRects.set(el, newRect);
  return newRect;
}

function getComputedStyle(el: HTMLElement): CSSStyleDeclaration {
  const style = state.computedStyles.get(el);
  if (style) return style;
  const newStyle = getComputedStyle(el);
  state.computedStyles.set(el, newStyle);
  return newStyle;
}

function clearCaches(): void {
  state.boundClientRects.clear();
  state.computedStyles.clear();
}

function clearCacheForElement(el: HTMLElement): void {
  state.boundClientRects.delete(el);
  state.computedStyles.delete(el);
}

export {
  getState,
  initEngineState,
  addActiveElement,
  removeActiveElement,
  removeActiveElements,
  sortActiveElements,
  addPendingHiddenElement,
  removePendingHiddenElement,
  updateCurrentBreakpointIndex,
  updateWindowSize,
  updateAppliedState,
  getBoundingClientRect,
  getComputedStyle,
  clearCaches,
  clearCacheForElement,
  deleteElement,
  addElement,
};
