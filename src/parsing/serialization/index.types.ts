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

type ProcessStylePropertyContext = CloneRulesContext & {
  propsResult: ProcessStylePropertyResult;
};

type ProcessStylePropertyResult = {
  style: Record<string, string>;
  specialProps: Record<string, string>;
};

export {
  type CloneDocContext,
  type CloneRulesContext,
  type ProcessStylePropertyContext,
  type ProcessStylePropertyResult,
};
