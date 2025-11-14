import { DocClone } from "../../../../../../src/parsing/serialization/docClone";
import { counter } from "./orderIDCounter";

function writeProductCard(docClone: DocClone) {
  const sheet = docClone.addSheet();

  let styleRule;

  styleRule = sheet.addStyleRule();
  styleRule.selector = ".product-card";
  styleRule.style = {
    "font-size": "1rem",
    "max-width": "24.5rem",
    "border-bottom-left-radius": "0.71rem",
    "border-bottom-right-radius": "0.71rem",
  };
  styleRule.orderID = counter.next();

  styleRule = sheet.addStyleRule();
  styleRule.selector = ".product-card__img--mobile";
  styleRule.style = {
    "border-top-left-radius": "0.71rem",
    "border-top-right-radius": "0.71rem",
    width: "100%",
    "object-position": "0px -5rem",
    "max-height": "17.14rem",
  };
  styleRule.orderID = counter.next();

  styleRule = sheet.addStyleRule();
  styleRule.selector = ".product-card__content";
  styleRule.style = {
    "padding-top": "1.71rem",
    "padding-right": "1.71rem",
    "padding-bottom": "1.71rem",
    "padding-left": "1.71rem",
  };
  styleRule.orderID = counter.next();

  styleRule = sheet.addStyleRule();
  styleRule.selector = ".product-card__category";
  styleRule.style = {
    "font-size": "0.85em",
    "letter-spacing": "0.41rem",
    "margin-bottom": "0.85rem",
  };
  styleRule.orderID = counter.next();

  styleRule = sheet.addStyleRule();
  styleRule.selector = ".product-card__title";
  styleRule.style = {
    "font-size": "2.28em",
    "line-height": "1em",
    "margin-bottom": "1.14rem",
  };
  styleRule.orderID = counter.next();

  styleRule = sheet.addStyleRule();
  styleRule.selector = ".product-card__description";
  styleRule.style = {
    "line-height": "1.64em",
    "margin-bottom": "1.71rem",
    "font-size": "1em",
  };
  styleRule.orderID = counter.next();

  styleRule = sheet.addStyleRule();
  styleRule.selector = ".product-card__price";
  styleRule.style = {
    "column-gap": "1.35rem",
    "row-gap": "1.35rem",
    "margin-bottom": "0px",
  };
  styleRule.orderID = counter.next();

  styleRule = sheet.addStyleRule();
  styleRule.selector = ".product-card__price--actual";
  styleRule.style = {
    "font-size": "2.28em",
  };
  styleRule.orderID = counter.next();

  styleRule = sheet.addStyleRule();
  styleRule.selector = ".product-card__price--original";
  styleRule.style = {
    "font-size": "0.92em",
  };
  styleRule.orderID = counter.next();

  styleRule = sheet.addStyleRule();
  styleRule.selector = ".product-card__button";
  styleRule.style = {
    "padding-top": "1.07rem",
    "padding-right": "1.07rem",
    "padding-bottom": "1.07rem",
    "padding-left": "1.07rem",
    "margin-top": "1.42rem",
    width: "100%",
    "column-gap": "0.85rem",
    "row-gap": "0.85rem",
    "border-top-right-radius": "0.57rem",
    "border-bottom-right-radius": "0.57rem",
    "border-top-left-radius": "0.57rem",
    "border-bottom-left-radius": "0.57rem",
  };
  styleRule.orderID = counter.next();

  const mediaRule = sheet.addMediaRule();
  mediaRule.minWidth = 600;
  styleRule = mediaRule.addStyleRule();

  styleRule.selector = ".product-card";
  styleRule.style = {
    "max-width": "42.85rem",
    "border-top-right-radius": "0.71rem",
    "border-bottom-right-radius": "0.71rem",
    "max-height": "32.14rem",
  };
  styleRule.orderID = counter.next();

  styleRule = mediaRule.addStyleRule();
  styleRule.selector = ".product-card__img--desktop";
  styleRule.style = {
    "border-top-left-radius": "0.71rem",
    "border-bottom-left-radius": "0.71rem",
    height: "100%",
  };
  styleRule.orderID = counter.next();

  styleRule = mediaRule.addStyleRule();
  styleRule.selector = ".product-card__content";
  styleRule.style = {
    "padding-top": "2.28rem",
    "padding-right": "2.28rem",
    "padding-bottom": "2.28rem",
    "padding-left": "2.28rem",
  };
  styleRule.orderID = counter.next();

  styleRule = mediaRule.addStyleRule();
  styleRule.selector = ".product-card__category";
  styleRule.style = {
    "margin-bottom": "1.42rem",
  };
  styleRule.orderID = counter.next();

  styleRule = mediaRule.addStyleRule();
  styleRule.selector = ".product-card__title";
  styleRule.style = {
    "margin-bottom": "1.71rem",
  };
  styleRule.orderID = counter.next();

  styleRule = mediaRule.addStyleRule();
  styleRule.selector = ".product-card__description";
  styleRule.style = {
    "margin-bottom": "2.07rem",
  };
  styleRule.orderID = counter.next();

  styleRule = mediaRule.addStyleRule();
  styleRule.selector = ".product-card__button";
  styleRule.style = {
    "margin-top": "2.14rem",
  };
  styleRule.orderID = counter.next();
}

export { writeProductCard };
