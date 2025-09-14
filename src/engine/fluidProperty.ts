import { FluidPropertyMetaData, FluidRange } from "../parse/index.types";
import { computeValueAsString, repeatLastComputedValue } from "./computation";
import {
  AppliedFluidPropertyState,
  FluidPropertyStateUpdate,
  IFluidProperty,
} from "./engine.types";

class FluidProperty implements IFluidProperty {
  el: HTMLElement;
  metaData: FluidPropertyMetaData;
  fluidRanges: (FluidRange | null)[];

  constructor(
    el: HTMLElement,
    metaData: FluidPropertyMetaData,
    fluidRanges: (FluidRange | null)[]
  ) {
    this.el = el;
    this.metaData = metaData;
    this.fluidRanges = fluidRanges;
  }

  update(
    appliedState: AppliedFluidPropertyState | undefined
  ): FluidPropertyStateUpdate | undefined {
    if (
      appliedState &&
      repeatLastComputedValue(
        appliedState.order,
        this.metaData.order,
        this.el.updateWidth
      )
    ) {
      if (appliedState.fluidProperty === this) return appliedState;
      return;
    }

    const value = computeValueAsString(
      this.fluidRanges,
      this.el,
      this.metaData.property
    );

    return {
      order: this.metaData.order,
      value,
      fluidProperty: this,
    };
  }
}

export { FluidProperty };
