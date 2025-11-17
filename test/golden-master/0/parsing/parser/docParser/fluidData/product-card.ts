import { FluidData } from "../../../../../../../src/fluidData";

function writeProductCard(fluidData: FluidData) {
  fluidData.addAutoForcedProp({
    anchor: ".product-card",
    selector: ".product-card",
    property: "font-size",
    value: "1rem",
  });

  fluidData.addSimpleRangedProp({
    anchor: ".product-card",
    selector: ".product-card",
    property: "max-width",
    minBp: 375,
    maxBp: 600,
    minValue: {
      value: 24.5,
      unit: "rem",
    },
    maxValue: {
      value: 42.85,
      unit: "rem",
    },
  });

  fluidData.addAutoForcedProp({
    anchor: ".product-card",
    selector: ".product-card",
    property: "border-bottom-left-radius",
    value: "0.71rem",
  });

  fluidData.addSimpleRangedProp({
    anchor: ".product-card",
    selector: ".product-card",
    property: "border-bottom-right-radius",
    minBp: 375,
    maxBp: 600,
    minValue: {
      value: 0.71,
      unit: "rem",
    },
    maxValue: {
      value: 0.71,
      unit: "rem",
    },
  });

  fluidData.addAutoForcedProp({
    anchor: ".product-card__img--mobile",
    selector: ".product-card__img--mobile",
    property: "border-top-left-radius",
    value: "0.71rem",
  });

  fluidData.addAutoForcedProp({
    anchor: ".product-card__img--mobile",
    selector: ".product-card__img--mobile",
    property: "border-top-right-radius",
    value: "0.71rem",
  });

  fluidData.addAutoForcedProp({
    anchor: ".product-card__img--mobile",
    selector: ".product-card__img--mobile",
    property: "width",
    value: "100%",
  });

  fluidData.addAutoForcedProp({
    anchor: ".product-card__img--mobile",
    selector: ".product-card__img--mobile",
    property: "object-position",
    value: "0px -5rem",
  });

  fluidData.addAutoForcedProp({
    anchor: ".product-card__img--mobile",
    selector: ".product-card__img--mobile",
    property: "max-height",
    value: "17.14rem",
  });

  fluidData.addSimpleRangedProp({
    anchor: ".product-card__content",
    selector: ".product-card__content",
    property: "padding-top",
    minBp: 375,
    maxBp: 600,
    minValue: {
      value: 1.71,
      unit: "rem",
    },
    maxValue: {
      value: 2.28,
      unit: "rem",
    },
  });

  fluidData.addSimpleRangedProp({
    anchor: ".product-card__content",
    selector: ".product-card__content",
    property: "padding-right",
    minBp: 375,
    maxBp: 600,
    minValue: {
      value: 1.71,
      unit: "rem",
    },
    maxValue: {
      value: 2.28,
      unit: "rem",
    },
  });

  fluidData.addSimpleRangedProp({
    anchor: ".product-card__content",
    selector: ".product-card__content",
    property: "padding-bottom",
    minBp: 375,
    maxBp: 600,
    minValue: {
      value: 1.71,
      unit: "rem",
    },
    maxValue: {
      value: 2.28,
      unit: "rem",
    },
  });

  fluidData.addSimpleRangedProp({
    anchor: ".product-card__content",
    selector: ".product-card__content",
    property: "padding-left",
    minBp: 375,
    maxBp: 600,
    minValue: {
      value: 1.71,
      unit: "rem",
    },
    maxValue: {
      value: 2.28,
      unit: "rem",
    },
  });

  fluidData.addAutoForcedProp({
    anchor: ".product-card__category",
    selector: ".product-card__category",
    property: "font-size",
    value: "0.85em",
  });

  fluidData.addAutoForcedProp({
    anchor: ".product-card__category",
    selector: ".product-card__category",
    property: "letter-spacing",
    value: "0.41rem",
  });

  fluidData.addSimpleRangedProp({
    anchor: ".product-card__category",
    selector: ".product-card__category",
    property: "margin-bottom",
    minBp: 375,
    maxBp: 600,
    minValue: {
      value: 0.85,
      unit: "rem",
    },
    maxValue: {
      value: 1.42,
      unit: "rem",
    },
  });

  fluidData.addAutoForcedProp({
    anchor: ".product-card__title",
    selector: ".product-card__title",
    property: "font-size",
    value: "2.28em",
  });

  fluidData.addAutoForcedProp({
    anchor: ".product-card__title",
    selector: ".product-card__title",
    property: "line-height",
    value: "1em",
  });

  fluidData.addSimpleRangedProp({
    anchor: ".product-card__title",
    selector: ".product-card__title",
    property: "margin-bottom",
    minBp: 375,
    maxBp: 600,
    minValue: {
      value: 1.14,
      unit: "rem",
    },
    maxValue: {
      value: 1.71,
      unit: "rem",
    },
  });

  fluidData.addAutoForcedProp({
    anchor: ".product-card__description",
    selector: ".product-card__description",
    property: "line-height",
    value: "1.64em",
  });

  fluidData.addSimpleRangedProp({
    anchor: ".product-card__description",
    selector: ".product-card__description",
    property: "margin-bottom",
    minBp: 375,
    maxBp: 600,
    minValue: {
      value: 1.71,
      unit: "rem",
    },
    maxValue: {
      value: 2.07,
      unit: "rem",
    },
  });

  fluidData.addAutoForcedProp({
    anchor: ".product-card__description",
    selector: ".product-card__description",
    property: "font-size",
    value: "1em",
  });

  fluidData.addAutoForcedProp({
    anchor: ".product-card__price",
    selector: ".product-card__price",
    property: "column-gap",
    value: "1.35rem",
  });

  fluidData.addAutoForcedProp({
    anchor: ".product-card__price",
    selector: ".product-card__price",
    property: "row-gap",
    value: "1.35rem",
  });

  fluidData.addAutoForcedProp({
    anchor: ".product-card__price",
    selector: ".product-card__price",
    property: "margin-bottom",
    value: "0px",
  });

  fluidData.addAutoForcedProp({
    anchor: ".product-card__price--actual",
    selector: ".product-card__price--actual",
    property: "font-size",
    value: "2.28em",
  });

  fluidData.addAutoForcedProp({
    anchor: ".product-card__price--original",
    selector: ".product-card__price--original",
    property: "font-size",
    value: "0.92em",
  });
  fluidData.addAutoForcedProp({
    anchor: ".product-card__button",
    selector: ".product-card__button",
    property: "width",
    value: "100%",
  });

  fluidData.addAutoForcedProp({
    anchor: ".product-card__button",
    selector: ".product-card__button",
    property: "border-top-right-radius",
    value: "0.57rem",
  });

  fluidData.addAutoForcedProp({
    anchor: ".product-card__button",
    selector: ".product-card__button",
    property: "border-bottom-right-radius",
    value: "0.57rem",
  });

  fluidData.addAutoForcedProp({
    anchor: ".product-card__button",
    selector: ".product-card__button",
    property: "border-top-left-radius",
    value: "0.57rem",
  });
  fluidData.addAutoForcedProp({
    anchor: ".product-card__button",
    selector: ".product-card__button",
    property: "border-bottom-left-radius",
    value: "0.57rem",
  });

  fluidData.addAutoForcedProp({
    anchor: ".product-card__button",
    selector: ".product-card__button",
    property: "padding-top",
    value: "1.07rem",
  });

  fluidData.addAutoForcedProp({
    anchor: ".product-card__button",
    selector: ".product-card__button",
    property: "padding-right",
    value: "1.07rem",
  });

  fluidData.addAutoForcedProp({
    anchor: ".product-card__button",
    selector: ".product-card__button",
    property: "padding-bottom",
    value: "1.07rem",
  });

  fluidData.addAutoForcedProp({
    anchor: ".product-card__button",
    selector: ".product-card__button",
    property: "padding-left",
    value: "1.07rem",
  });

  fluidData.addSimpleRangedProp({
    anchor: ".product-card__button",
    selector: ".product-card__button",
    property: "margin-top",
    minBp: 375,
    maxBp: 600,
    minValue: {
      value: 1.42,
      unit: "rem",
    },
    maxValue: {
      value: 2.14,
      unit: "rem",
    },
  });

  fluidData.addAutoForcedProp({
    anchor: ".product-card__button",
    selector: ".product-card__button",
    property: "column-gap",
    value: "0.85rem",
  });

  fluidData.addAutoForcedProp({
    anchor: ".product-card__button",
    selector: ".product-card__button",
    property: "row-gap",
    value: "0.85rem",
  });

  fluidData.addAutoForcedProp({
    anchor: ".product-card",
    selector: ".product-card",
    property: "border-top-right-radius",
    value: "0.71rem",
  });

  fluidData.addAutoForcedProp({
    anchor: ".product-card",
    selector: ".product-card",
    property: "max-height",
    value: "32.14rem",
  });

  fluidData.addAutoForcedProp({
    anchor: ".product-card__img--desktop",
    selector: ".product-card__img--desktop",
    property: "border-top-left-radius",
    value: "0.71rem",
  });

  fluidData.addAutoForcedProp({
    anchor: ".product-card__img--desktop",
    selector: ".product-card__img--desktop",
    property: "border-bottom-left-radius",
    value: "0.71rem",
  });

  fluidData.addAutoForcedProp({
    anchor: ".product-card__img--desktop",
    selector: ".product-card__img--desktop",
    property: "height",
    value: "100%",
  });
}

export { writeProductCard };
