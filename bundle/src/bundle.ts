import { getQueue, EventBus, makeEventContext } from "gold-sight";
import { makeDefaultGlobal } from "../../src/utils/global";

import {
  assertionMaster as docClonerAssertionMaster,
  wrapAll as wrapAllCloneDoc,
} from "../../test/parsing/serialization/docCloner/goldSight";

wrapAllCloneDoc();

import { cloneDoc } from "../../src/parsing/serialization/docCloner";

export {
  getQueue,
  cloneDoc,
  docClonerAssertionMaster,
  EventBus,
  makeEventContext,
  makeDefaultGlobal,
};
