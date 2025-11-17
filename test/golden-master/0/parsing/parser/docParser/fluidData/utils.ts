import { FluidData } from "../../../../../../../src/fluidData";

function writeUtils(fluidData: FluidData) {
  fluidData.addAutoForcedProp({
    anchor: ".u-container",
    selector: ".u-container",
    property: "padding-top",
    value: "0px",
  });
  fluidData.addAutoForcedProp({
    anchor: ".u-container",
    selector: ".u-container",
    property: "padding-right",
    value: "1.14rem",
  });
  fluidData.addAutoForcedProp({
    anchor: ".u-container",
    selector: ".u-container",
    property: "padding-bottom",
    value: "0px",
  });
  fluidData.addAutoForcedProp({
    anchor: ".u-container",
    selector: ".u-container",
    property: "padding-left",
    value: "1.14rem",
  });
}

export { writeUtils };
