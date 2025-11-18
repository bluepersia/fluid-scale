import {
  getGlobalState,
  initEngineState,
  insertFluidPropertiesForAnchor,
  wrap,
} from "./engine/engine";
import type { Global, UserSettings } from "./index.types";
import { parseDoc } from "./parsing/parser/docParser";
import { cloneDoc } from "./parsing/serialization/docCloner";
import { addElements as addElementsEngine } from "./engine/engine";

let addElements = (els: Node[], ctx: Global) => {
  const htmlEls = els.filter(
    (el) => el instanceof HTMLElement
  ) as HTMLElement[];

  const { allEls, fluidData } = getGlobalState();

  const toAddEls = addElementsEngine(htmlEls, allEls, {
    ...ctx,
    fluidData,
  });

  for (const elState of toAddEls) {
    allEls.set(elState.el, elState);
  }
};

let init = (config: UserSettings) => {
  const docClone = cloneDoc(document, { ...config, isBrowser: true });

  const { fluidData, breakpoints } = parseDoc(docClone, config);

  initEngineState(breakpoints, fluidData);

  const allElements = Array.from(document.querySelectorAll("*"));
  addElements(allElements, config);
};

function wrapSetup(
  initWrapped: typeof init,
  addElementsEngineWrapped: typeof addElementsEngine,
  insertFluidPropertiesForAnchorWrapped: typeof insertFluidPropertiesForAnchor
) {
  init = initWrapped;
  wrap(addElementsEngineWrapped, insertFluidPropertiesForAnchorWrapped);
}

export { init, wrapSetup };
