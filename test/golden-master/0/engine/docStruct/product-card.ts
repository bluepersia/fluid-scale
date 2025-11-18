import { RangedPropertyData } from "../../../../../src/fluidData";
import { FluidProperty } from "../../../../../src/index.types";
import { DocStruct } from "../../../../engine/setup/docStruct";
import { fluidData } from "../../parsing/parser/docParser/fluidData/fluidData";

function writeProductCard(docStruct: DocStruct) {
  let property: FluidProperty;

  property = docStruct.addFluidProperty("product-card", RangedPropertyData);
  property.property = "max-width";
  property.selector = ".product-card";
  property.data =
    fluidData.anchors[".product-card"].selectors[".product-card"].properties[
      "max-width"
    ];

  property = docStruct.addFluidProperty("product-card", RangedPropertyData);
  property.property = "border-bottom-right-radius";
  property.selector = ".product-card";
  property.data =
    fluidData.anchors[".product-card"].selectors[".product-card"].properties[
      "border-bottom-right-radius"
    ];

  property = docStruct.addFluidProperty(
    "product-card__content",
    RangedPropertyData
  );
  property.property = "padding-top";
  property.selector = ".product-card__content";
  property.data =
    fluidData.anchors[".product-card__content"].selectors[
      ".product-card__content"
    ].properties["padding-top"];

  property = docStruct.addFluidProperty(
    "product-card__content",
    RangedPropertyData
  );
  property.property = "padding-right";
  property.selector = ".product-card__content";
  property.data =
    fluidData.anchors[".product-card__content"].selectors[
      ".product-card__content"
    ].properties["padding-right"];

  property = docStruct.addFluidProperty(
    "product-card__content",
    RangedPropertyData
  );
  property.property = "padding-bottom";
  property.selector = ".product-card__content";
  property.data =
    fluidData.anchors[".product-card__content"].selectors[
      ".product-card__content"
    ].properties["padding-bottom"];

  property = docStruct.addFluidProperty(
    "product-card__content",
    RangedPropertyData
  );
  property.property = "padding-left";
  property.selector = ".product-card__content";
  property.data =
    fluidData.anchors[".product-card__content"].selectors[
      ".product-card__content"
    ].properties["padding-left"];

  property = docStruct.addFluidProperty(
    "product-card__category",
    RangedPropertyData
  );
  property.property = "margin-bottom";
  property.selector = ".product-card__category";
  property.data =
    fluidData.anchors[".product-card__category"].selectors[
      ".product-card__category"
    ].properties["margin-bottom"];

  property = docStruct.addFluidProperty(
    "product-card__title",
    RangedPropertyData
  );
  property.property = "margin-bottom";
  property.selector = ".product-card__title";
  property.data =
    fluidData.anchors[".product-card__title"].selectors[
      ".product-card__title"
    ].properties["margin-bottom"];

  property = docStruct.addFluidProperty(
    "product-card__description",
    RangedPropertyData
  );
  property.property = "margin-bottom";
  property.selector = ".product-card__description";
  property.data =
    fluidData.anchors[".product-card__description"].selectors[
      ".product-card__description"
    ].properties["margin-bottom"];

  property = docStruct.addFluidProperty(
    "product-card__button",
    RangedPropertyData
  );
  property.property = "margin-top";
  property.selector = ".product-card__button";
  property.data =
    fluidData.anchors[".product-card__button"].selectors[
      ".product-card__button"
    ].properties["margin-top"];
}

export { writeProductCard };
