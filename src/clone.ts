/** We clone the document into a serialized JSON format, so that we can use this to test the parser, using realistic materual.*/

const FLUID_PROPERTY_NAMES = [
  "font-size",
  "line-height",
  "letter-spacing",
  "word-spacing",
  "text-indent",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "border-top-width",
  "border-right-width",
  "border-bottom-width",
  "border-left-width",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-bottom-right-radius",
  "border-bottom-left-radius",
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
  "--fluid-bg-size",
  "top",
  "left",
  "right",
  "bottom",
  "column-gap",
  "row-gap",
  "object-position",
];

const cloneDocumentTemplate = `

function getFluidProperties(style) {
  const result = {};

  for (const property of FLUID_PROPERTY_NAMES) {
    const value = style.getPropertyValue(property);
    if (value) {
      result[property] = value;
    }
  }
  return result;
}

  const resultDocument = {
    styleSheets: [],
  };

  for (const sheet of Array.from(document.styleSheets)) {
    let rules;
    try {
      rules = sheet.cssRules;
    } catch (error) {
      if (error instanceof DOMException && error.name === "SecurityError") {
        continue;
      }
      throw error;
    }

    if (!rules) continue;

    const mockSheet = { rules: [] };
    resultDocument.styleSheets.push(mockSheet);

    for (const rule of Array.from(rules)) {
      if (rule.type === 1) {
        const styleRule = rule;
        const mockRule = {
          type: rule.type,
          selector: styleRule.selectorText,
          style: getFluidProperties(styleRule.style),
        };
        mockSheet.rules.push(mockRule);
      } else if (rule.type === 4) {
        const mediaRule = rule;
        const mockRule = {
          type: rule.type,
          media: { mediaText: mediaRule.media.mediaText },
          rules: [],
        };
        for (const rule of Array.from(mediaRule.cssRules)) {
          const styleRule = rule;
          const mockStyleRule = {
            type: 1,
            selector: styleRule.selectorText,
            style: getFluidProperties(styleRule.style),
          };
          mockRule.rules.push(mockStyleRule);
        }
        mockSheet.rules.push(mockRule);
      }
    }
  }

  return resultDocument;
`;

export { cloneDocumentTemplate, FLUID_PROPERTY_NAMES };
