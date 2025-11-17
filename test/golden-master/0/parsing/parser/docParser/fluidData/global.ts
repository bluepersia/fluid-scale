import { FluidData } from "../../../../../../../src/fluidData";

function writeGlobal(fluidData: FluidData) {
  fluidData.addAutoForcedProp({
    anchor: "html",
    selector: "html",
    property: "font-size",
    value: "14px",
  });

  fluidData.addAutoForcedProp({
    anchor: "body",
    selector: "body",
    property: "margin-top",
    value: "0px",
  });

  fluidData.addAutoForcedProp({
    anchor: "body",
    selector: "body",
    property: "margin-right",
    value: "0px",
  });

  fluidData.addAutoForcedProp({
    anchor: "body",
    selector: "body",
    property: "margin-bottom",
    value: "0px",
  });
  fluidData.addAutoForcedProp({
    anchor: "body",
    selector: "body",
    property: "margin-left",
    value: "0px",
  });
  fluidData.addAutoForcedProp({
    anchor: "body",
    selector: "body",
    property: "padding-top",
    value: "0px",
  });
  fluidData.addAutoForcedProp({
    anchor: "body",
    selector: "body",
    property: "padding-right",
    value: "0px",
  });
  fluidData.addAutoForcedProp({
    anchor: "body",
    selector: "body",
    property: "padding-bottom",
    value: "0px",
  });
  fluidData.addAutoForcedProp({
    anchor: "body",
    selector: "body",
    property: "padding-left",
    value: "0px",
  });
  fluidData.addAutoForcedProp({
    anchor: "body",
    selector: "body",
    property: "min-height",
    value: "100vh",
  });

  fluidData.addAutoForcedProp({
    anchor: "*",
    selector: "*",
    property: "margin-top",
    value: "0px",
  });
  fluidData.addAutoForcedProp({
    anchor: "*",
    selector: "*",
    property: "margin-right",
    value: "0px",
  });
  fluidData.addAutoForcedProp({
    anchor: "*",
    selector: "*",
    property: "margin-bottom",
    value: "0px",
  });
  fluidData.addAutoForcedProp({
    anchor: "*",
    selector: "*",
    property: "margin-left",
    value: "0px",
  });

  fluidData.addAutoForcedProp({
    anchor: "::before",
    selector: "::before",
    property: "margin-top",
    value: "0px",
  });
  fluidData.addAutoForcedProp({
    anchor: "::before",
    selector: "::before",
    property: "margin-right",
    value: "0px",
  });
  fluidData.addAutoForcedProp({
    anchor: "::before",
    selector: "::before",
    property: "margin-bottom",
    value: "0px",
  });
  fluidData.addAutoForcedProp({
    anchor: "::before",
    selector: "::before",
    property: "margin-left",
    value: "0px",
  });
  fluidData.addAutoForcedProp({
    anchor: "::after",
    selector: "::after",
    property: "margin-top",
    value: "0px",
  });
  fluidData.addAutoForcedProp({
    anchor: "::after",
    selector: "::after",
    property: "margin-right",
    value: "0px",
  });
  fluidData.addAutoForcedProp({
    anchor: "::after",
    selector: "::after",
    property: "margin-bottom",
    value: "0px",
  });
  fluidData.addAutoForcedProp({
    anchor: "::after",
    selector: "::after",
    property: "margin-left",
    value: "0px",
  });

  fluidData.addAutoForcedProp({
    anchor: "img",
    selector: "img",
    property: "max-width",
    value: "100%",
  });
  fluidData.addAutoForcedProp({
    anchor: "img",
    selector: "img",
    property: "height",
    value: "auto",
  });
}

export { writeGlobal };
