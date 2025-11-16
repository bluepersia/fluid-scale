import type { Global } from "../index.types";

function makeDefaultGlobal(): Global {
  return {
    autoForce: true,
  };
}

export { makeDefaultGlobal };
