import type { Global } from "../index.types";

function makeDefaultGlobal(): Global {
  return {
    autoForce: true,
    seekAlg: "stopAt1stNonMedia",
  };
}

export { makeDefaultGlobal };
