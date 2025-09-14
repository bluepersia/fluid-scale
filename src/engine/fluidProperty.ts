import { FluidPropertyMetaData, FluidRange } from "../parse/index.types";
import {
  computeValueAsString,
  isLowerOrder,
  repeatLastComputedValue,
} from "./computation";
import { FluidPropertyState, IFluidProperty } from "./engine.types";

class FluidProperty implements IFluidProperty {
  el: HTMLElement;
  metaData: FluidPropertyMetaData;
  fluidRanges: (FluidRange | null)[];
  state: FluidPropertyState;

  constructor(
    el: HTMLElement,
    metaData: FluidPropertyMetaData,
    fluidRanges: (FluidRange | null)[]
  ) {
    this.el = el;
    this.metaData = metaData;
    this.fluidRanges = fluidRanges;

    if (!el.fluidPropertyStates) {
      el.fluidPropertyStates = {};
    }

    if (!el.fluidPropertyStates[this.metaData.property]) {
      el.fluidPropertyStates[this.metaData.property] = newFluidPropertyState(
        this.metaData.property
      );
    }

    this.state = el.fluidPropertyStates[this.metaData.property];
  }

  update(): void {
    if (isLowerOrder(this.metaData.order, this.state.order)) return;

    if (repeatLastComputedValue(this.state.applied, this.metaData.order)) {
      this.state.value = this.state.applied!.value;
      this.state.fluidProperty = this.state.applied!.fluidProperty;
      return;
    }

    const value = computeValueAsString(
      this.fluidRanges,
      this.el,
      this.metaData.property
    );

    this.state.order = this.metaData.order;
    this.state.value = value;
    this.state.fluidProperty = this;
  }
}

function newFluidPropertyState(property: string): FluidPropertyState {
  return {
    order: -1,
    value: "",
    property,
  };
}

export { FluidProperty };
