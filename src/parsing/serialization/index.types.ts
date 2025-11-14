import type { Global } from "../../index.types";
import type { EventContext } from "gold-sight";

type CloneDocContext = Global & {
  counter?: {
    orderID: number;
  };
  isBrowser: boolean;
} & EventContext;

type CloneRulesContext = CloneDocContext & {
  mediaWidth?: number;
};

export { type CloneDocContext, type CloneRulesContext };
