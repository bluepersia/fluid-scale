import { DocClone } from "../../../../../../src/parsing/serialization/docClone";
import { counter } from "./orderIDCounter";
function writeGlobal(docClone: DocClone) {
  const sheet = docClone.addSheet();

  let styleRule;

  styleRule = sheet.addStyleRule();
  styleRule.selector = "html";
  styleRule.style = {
    "font-size": "14px",
  };
  styleRule.orderID = counter.next();

  styleRule = sheet.addStyleRule();
  styleRule.selector = "body";
  styleRule.style = {
    "margin-top": "0px",
    "margin-right": "0px",
    "margin-bottom": "0px",
    "margin-left": "0px",
    "padding-top": "0px",
    "padding-right": "0px",
    "padding-bottom": "0px",
    "padding-left": "0px",
    "min-height": "100vh",
  };
  styleRule.orderID = counter.next();

  styleRule = sheet.addStyleRule();
  styleRule.selector = "*, ::before, ::after";
  styleRule.style = {
    "margin-top": "0px",
    "margin-right": "0px",
    "margin-bottom": "0px",
    "margin-left": "0px",
  };
  styleRule.orderID = counter.next();

  styleRule = sheet.addStyleRule();
  styleRule.selector = "img";
  styleRule.style = {
    "max-width": "100%",
    height: "auto",
  };
  styleRule.orderID = counter.next();

  const mediaRule = sheet.addMediaRule();
  mediaRule.minWidth = 375;
}

export { writeGlobal };
