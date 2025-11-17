import type { FluidData } from "../fluidData";
import type { Global } from "../index.types";

type AddElementsContext = Global & {
  fluidData: FluidData;
};

export type { AddElementsContext };
