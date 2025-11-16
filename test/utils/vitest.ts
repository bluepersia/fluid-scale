let expect;
if (process.env.NODE_ENV === "test") {
  expect = (await import("vitest")).expect;
}

function toBeEqualDefined(actual: any, expected: any, msg?: string) {
  expect(actual, msg).toBeDefined();
  expect(actual, msg).not.toBeNull();
  expect(actual, msg).toEqual(expected);
}

function toMatchObjectDefined(actual: any, expected: any, msg?: string) {
  expect(actual, msg).toBeDefined();
  expect(actual, msg).not.toBeNull();
  expect(actual, msg).toMatchObject(expected);
}

function makeTestMessage(state: { master?: { index: number } }, object?: any) {
  let masterObj = {};
  let additionalObj = {};
  if (state.master) {
    masterObj = { masterIndex: state.master.index };
  }
  if (object) {
    additionalObj = object;
  }
  return JSON.stringify({ ...masterObj, ...additionalObj });
}

export { makeTestMessage, toBeEqualDefined, toMatchObjectDefined };
