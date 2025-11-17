import { ElementState } from "../../src/index.types";
import { SerializedElement } from "./index.types";

function serializeElStates(elStates: ElementState[]) {
  const serializedElements: SerializedElement[] = [];
  for (const elState of elStates) {
    serializedElements.push({
      goldenId: elState.el.dataset.goldenId!,
      fluidProperties: elState.fluidProperties,
    });
  }
  return serializedElements;
}

export { serializeElStates };
