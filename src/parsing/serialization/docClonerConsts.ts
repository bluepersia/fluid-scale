const FLUID_PROPERTY_NAMES = new Set([
  "font-size",
  "line-height",
  "letter-spacing",
  "word-spacing",
  "text-indent",
  "width",
  "min-width",
  "max-width",
  "height",
  "min-height",
  "max-height",
  "grid-template-columns",
  "grid-template-rows",
  "background-position-x",
  "background-position-y",
  "padding",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "margin",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "border-radius",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-bottom-right-radius",
  "border-bottom-left-radius",
  "gap",
  "column-gap",
  "row-gap",
  "--fluid-bg-size",
  "top",
  "left",
  "right",
  "bottom",
  "object-position",
]);

const SHORTHAND_PROPERTIES: {
  [shorthand: string]: Map<number, Map<number, string[]>>;
} = {
  padding: new Map([
    [
      1,
      new Map([
        [0, ["padding-top", "padding-right", "padding-bottom", "padding-left"]],
      ]),
    ],
    [
      2,
      new Map([
        [0, ["padding-top", "padding-bottom"]],
        [1, ["padding-right", "padding-left"]],
      ]),
    ],
    [
      3,
      new Map([
        [0, ["padding-top"]],
        [1, ["padding-right", "padding-left"]],
        [2, ["padding-bottom"]],
      ]),
    ],
    [
      4,
      new Map([
        [0, ["padding-top"]],
        [1, ["padding-right"]],
        [2, ["padding-bottom"]],
        [3, ["padding-left"]],
      ]),
    ],
  ]),
  margin: new Map([
    [
      1,
      new Map([
        [0, ["margin-top", "margin-right", "margin-bottom", "margin-left"]],
      ]),
    ],
    [
      2,
      new Map([
        [0, ["margin-top", "margin-bottom"]],
        [1, ["margin-right", "margin-left"]],
      ]),
    ],
    [
      3,
      new Map([
        [0, ["margin-top"]],
        [1, ["margin-right", "margin-left"]],
        [2, ["margin-bottom"]],
      ]),
    ],
    [
      4,
      new Map([
        [0, ["margin-top"]],
        [1, ["margin-right"]],
        [2, ["margin-bottom"]],
        [3, ["margin-left"]],
      ]),
    ],
  ]),
  border: new Map([
    [
      1,
      new Map([
        [0, ["border-top", "border-right", "border-bottom", "border-left"]],
      ]),
    ],
    [
      2,
      new Map([
        [0, ["border-top", "border-bottom"]],
        [1, ["border-right", "border-left"]],
      ]),
    ],
    [
      3,
      new Map([
        [0, ["border-top"]],
        [1, ["border-right", "border-left"]],
        [2, ["border-bottom"]],
      ]),
    ],
    [
      4,
      new Map([
        [0, ["border-top"]],
        [1, ["border-right"]],
        [2, ["border-bottom"]],
        [3, ["border-left"]],
      ]),
    ],
  ]),
  "border-radius": new Map([
    [
      1,
      new Map([
        [
          0,
          [
            "border-top-left-radius",
            "border-top-right-radius",
            "border-bottom-right-radius",
            "border-bottom-left-radius",
          ],
        ],
      ]),
    ],
    [
      2,
      new Map([
        [0, ["border-top-left-radius", "border-bottom-right-radius"]],
        [1, ["border-top-right-radius", "border-bottom-left-radius"]],
      ]),
    ],
    [
      3,
      new Map([
        [0, ["border-top-left-radius"]],
        [1, ["border-top-right-radius", "border-bottom-left-radius"]],
        [2, ["border-bottom-right-radius"]],
      ]),
    ],
    [
      4,
      new Map([
        [0, ["border-top-left-radius"]],
        [1, ["border-top-right-radius"]],
        [2, ["border-bottom-right-radius"]],
        [3, ["border-bottom-left-radius"]],
      ]),
    ],
  ]),
  gap: new Map([[1, new Map([[0, ["column-gap", "row-gap"]]])]]),
  "background-position": new Map([
    [2, new Map([[0, ["background-position-x", "background-position-y"]]])],
  ]),
};

const SPECIAL_PROPERTIES = new Set([
  "--lock",
  "--force",
  "--span-start",
  "--span-end",
]);

const EXPLICIT_PROPS_FOR_SHORTHAND = new Map<string, string[]>([
  [
    "padding",
    ["padding-top", "padding-right", "padding-bottom", "padding-left"],
  ],
  ["margin", ["margin-top", "margin-right", "margin-bottom", "margin-left"]],
  ["border", ["border-top", "border-right", "border-bottom", "border-left"]],
  [
    "border-radius",
    [
      "border-top-left-radius",
      "border-top-right-radius",
      "border-bottom-right-radius",
      "border-bottom-left-radius",
    ],
  ],
  ["gap", ["column-gap", "row-gap"]],
  ["background-position", ["background-position-x", "background-position-y"]],
]);

export {
  FLUID_PROPERTY_NAMES,
  SHORTHAND_PROPERTIES,
  SPECIAL_PROPERTIES,
  EXPLICIT_PROPS_FOR_SHORTHAND,
};
