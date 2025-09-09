import { describe, test, expect } from "vitest";
import { cloneDocumentTemplate, FLUID_PROPERTY_NAMES } from "../src/clone";

const expectedClone = {
  styleSheets: [
    {
      rules: [
        {
          type: 1,
          selector: ":root",
          style: {},
        },
        {
          type: 1,
          selector: "html",
          style: {
            "font-size": "14px",
          },
        },
        {
          type: 1,
          selector: "body",
          style: {
            "margin-top": "0px",
            "margin-right": "0px",
            "margin-bottom": "0px",
            "margin-left": "0px",
            "padding-top": "0px",
            "padding-right": "0px",
            "padding-bottom": "0px",
            "padding-left": "0px",
            "min-height": "100vh",
          },
        },
        {
          type: 1,
          selector: "*, ::before, ::after",
          style: {
            "margin-top": "0px",
            "margin-right": "0px",
            "margin-bottom": "0px",
            "margin-left": "0px",
          },
        },
        {
          type: 1,
          selector: "img",
          style: {
            "max-width": "100%",
            height: "auto",
          },
        },
        {
          type: 4,
          media: { mediaText: "(min-width: 375px)" },
          rules: [],
        },
      ],
    },
    {
      rules: [
        {
          type: 1,
          selector: ".u-container",
          style: {
            "padding-top": "0px",
            "padding-right": "1.14rem",
            "padding-bottom": "0px",
            "padding-left": "1.14rem",
          },
        },
      ],
    },
    {
      rules: [
        {
          type: 1,
          selector: ".product-card",
          style: {
            "font-size": "1rem",
            "border-bottom-left-radius": "0.71rem",
            "border-bottom-right-radius": "0.71rem",
            "max-width": "24.5rem",
          },
        },
        {
          type: 1,
          selector: ".product-card__img--desktop",
          style: {},
        },
        {
          type: 1,
          selector: ".product-card__img--mobile",
          style: {
            "border-top-left-radius": "0.71rem",
            "border-top-right-radius": "0.71rem",
            width: "100%",
            "object-position": "0px -5rem",
            "max-height": "17.14rem",
          },
        },
        {
          type: 1,
          selector: ".product-card__content",
          style: {
            "padding-top": "1.71rem",
            "padding-right": "1.71rem",
            "padding-bottom": "1.71rem",
            "padding-left": "1.71rem",
          },
        },
        {
          type: 1,
          selector: ".product-card__category",
          style: {
            "font-size": "0.85em",
            "letter-spacing": "0.41rem",
            "margin-bottom": "0.85rem",
          },
        },
        {
          type: 1,
          selector: ".product-card__title",
          style: {
            "font-size": "2.28em",
            "line-height": "1em",
            "margin-bottom": "1.14rem",
          },
        },
        {
          type: 1,
          selector: ".product-card__description",
          style: {
            "line-height": "1.64em",
            "margin-bottom": "1.71rem",
            "font-size": "1em",
          },
        },
        {
          type: 1,
          selector: ".product-card__price",
          style: {
            "column-gap": "1.35rem",
            "row-gap": "1.35rem",
            "margin-bottom": "0px",
          },
        },
        {
          type: 1,
          selector:
            ".product-card__price--actual, .product-card__price--original",
          style: {},
        },
        {
          type: 1,
          selector: ".product-card__price--actual",
          style: {
            "font-size": "2.28em",
          },
        },
        {
          type: 1,
          selector: ".product-card__price--original",
          style: {
            "font-size": "0.92em",
          },
        },
        {
          type: 1,
          selector: ".product-card__button",
          style: {
            width: "100%",
            "border-top-left-radius": "0.57rem",
            "border-top-right-radius": "0.57rem",
            "border-bottom-left-radius": "0.57rem",
            "border-bottom-right-radius": "0.57rem",
            "padding-top": "1.07rem",
            "padding-right": "1.07rem",
            "padding-bottom": "1.07rem",
            "padding-left": "1.07rem",
            "margin-top": "1.42rem",
            "column-gap": "0.85rem",
            "row-gap": "0.85rem",
          },
        },
        {
          type: 1,
          selector: ".product-card__button:hover",
          style: {},
        },
        {
          type: 4,
          media: { mediaText: "(min-width: 600px)" },
          rules: [
            {
              type: 1,
              selector: ".product-card",
              style: {
                "max-width": "42.85rem",
                "border-top-right-radius": "0.71rem",
                "border-bottom-right-radius": "0.71rem",
                "max-height": "32.14rem",
              },
            },
            {
              type: 1,
              selector: ".product-card__img--mobile",
              style: {},
            },
            {
              type: 1,
              selector: ".product-card__img--desktop",
              style: {
                "border-top-left-radius": "0.71rem",
                "border-bottom-left-radius": "0.71rem",
                height: "100%",
              },
            },
            {
              type: 1,
              selector: ".product-card__content",
              style: {
                "padding-top": "2.28rem",
                "padding-right": "2.28rem",
                "padding-bottom": "2.28rem",
                "padding-left": "2.28rem",
              },
            },
            {
              type: 1,
              selector: ".product-card__category",
              style: {
                "margin-bottom": "1.42rem",
              },
            },
            {
              type: 1,
              selector: ".product-card__title",
              style: {
                "margin-bottom": "1.71rem",
              },
            },
            {
              type: 1,
              selector: ".product-card__description",
              style: {
                "margin-bottom": "2.07rem",
              },
            },
            {
              type: 1,
              selector: ".product-card__button",
              style: {
                "margin-top": "2.14rem",
              },
            },
          ],
        },
      ],
    },
  ],
};

describe("cloneDocumentTemplate", () => {
  test("should clone the document", async () => {
    const clonedDocument = await globalThis.playwrightPages[0].evaluate(
      async ({ cloneDocumentTemplate, FLUID_PROPERTY_NAMES }) => {
        const cloneDocument = new Function(
          "document",
          "FLUID_PROPERTY_NAMES",
          cloneDocumentTemplate
        );
        const clonedDocument = cloneDocument(document, FLUID_PROPERTY_NAMES);
        return clonedDocument;
      },
      { cloneDocumentTemplate, FLUID_PROPERTY_NAMES }
    );
    expect(clonedDocument).toMatchObject(expectedClone);
  });
});
