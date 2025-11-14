import type { EventContext } from "gold-sight";
import type { Global } from "../../index.types";

type CloneDocContext = Global &
  EventContext & {
    counter?: {
      orderID: number;
    };
  };

export { type CloneDocContext };
