import type { Global } from "../../index.types";

type CloneDocContext = Global & {
  counter?: {
    orderID: number;
  };
  isBrowser: boolean;
};

type CloneRulesContext = CloneDocContext & {
  mediaWidth?: number;
};

export { type CloneDocContext, type CloneRulesContext };
