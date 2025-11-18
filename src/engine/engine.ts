import {
  AutoForcedPropertyData,
  FluidData,
  RangedPropertyData,
} from "../fluidData";
import type { ElementState, FluidProperty, GlobalState } from "../index.types";
import { makeDefaultGlobal } from "../utils/global";
import type { AddElementsContext } from "./index.types";

let globalState: GlobalState = newState();

function getGlobalState(): GlobalState {
  return { ...globalState };
}

function newState(): GlobalState {
  return {
    allEls: new Map(),
    fluidData: new FluidData(makeDefaultGlobal()),
    breakpoints: [],
  };
}

function resetState() {
  globalState = newState();
}

function initEngineState(breakpoints: number[], fluidData: FluidData) {
  globalState.breakpoints = breakpoints;
  globalState.fluidData = fluidData;
}

const insertFluidPropertiesForAnchorRouter = [
  (el: HTMLElement, ctx: AddElementsContext) => {
    const classes = el.classList;
    const fluidProperties: FluidProperty[] = [];
    for (const className of classes) {
      fluidProperties.push(
        ...insertFluidPropertiesForAnchor(`.${className}`, el, ctx)
      );
    }
    return fluidProperties;
  },
  (el: HTMLElement, ctx: AddElementsContext) => {
    if (!el.id) return [];
    return insertFluidPropertiesForAnchor(`#${el.id}`, el, ctx);
  },
  (el: HTMLElement, ctx: AddElementsContext) => {
    return insertFluidPropertiesForAnchor(el.tagName.toLowerCase(), el, ctx);
  },
];
let addElements = (
  els: HTMLElement[],
  allEls: Map<HTMLElement, ElementState>,
  ctx: AddElementsContext
): ElementState[] => {
  const toAddEls: ElementState[] = [];

  for (const el of els) {
    if (allEls.has(el)) continue;

    const elState: ElementState = {
      el,
      fluidProperties: [],
    };
    let { fluidProperties } = elState;

    for (const route of insertFluidPropertiesForAnchorRouter) {
      fluidProperties.push(...route(el, ctx));
    }

    fluidProperties = filterForcedProperties(fluidProperties);

    if (fluidProperties.length <= 0) continue;

    elState.fluidProperties = fluidProperties;

    toAddEls.push(elState);
  }

  return toAddEls;
};

let insertFluidPropertiesForAnchor = (
  anchor: string,
  el: HTMLElement,
  ctx: AddElementsContext
): FluidProperty[] => {
  const { fluidData, event } = ctx;
  const anchorData = fluidData.anchors[anchor];

  if (!anchorData) return [];

  const fluidProperties: FluidProperty[] = [];

  for (const [selector, selectorData] of Object.entries(anchorData.selectors)) {
    if (!el.matches(selector)) {
      if (dev)
        event?.emit("omitFluidPropertyInsertion", ctx, {
          selector,
          why: "selectorDoesNotMatch",
        });
      continue;
    }
    for (const [property, propertyData] of Object.entries(
      selectorData.properties
    )) {
      if (dev)
        event?.emit("insertFluidProperty", ctx, {
          selector,
          property,
        });
      fluidProperties.push({ property, data: propertyData, selector });
    }
  }

  return fluidProperties;
};

let filterForcedProperties = (
  fluidProperties: FluidProperty[]
): FluidProperty[] => {
  return fluidProperties.filter((property) => {
    if (property.data instanceof AutoForcedPropertyData) {
      return (
        fluidProperties.reduce((prev, curr) => {
          if (
            curr.property === property.property &&
            curr.data instanceof RangedPropertyData
          )
            return prev + 1;

          return prev;
        }, 0) > 1
      );
    }
    return true;
  });
};

function wrap(
  addElementsWrapped: typeof addElements,
  insertFluidPropertiesForAnchorWrapped: typeof insertFluidPropertiesForAnchor
) {
  addElements = addElementsWrapped;
  insertFluidPropertiesForAnchor = insertFluidPropertiesForAnchorWrapped;
}

export {
  getGlobalState,
  addElements,
  resetState,
  initEngineState,
  wrap,
  insertFluidPropertiesForAnchor,
};
