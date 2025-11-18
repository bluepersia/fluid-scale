import type { EventContext } from "gold-sight";
import type { FluidData } from "../fluidData";
import type { Global } from "../index.types";

type AddElementsContext = Global &
  EventContext & {
    fluidData: FluidData;
  };

export type { AddElementsContext };
