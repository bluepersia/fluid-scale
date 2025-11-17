import { FluidData } from "../../../../../../../src/fluidData";
import { makeDefaultGlobal } from "../../../../../../../src/utils/global";
import { writeGlobal } from "./global";
import { writeProductCard } from "./product-card";
import { writeUtils } from "./utils";

const fluidData: FluidData = new FluidData(makeDefaultGlobal());

writeGlobal(fluidData);
writeUtils(fluidData);
writeProductCard(fluidData);

export { fluidData };
