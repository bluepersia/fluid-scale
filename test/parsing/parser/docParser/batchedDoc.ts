import { Global } from "../../../../src/index.types";
import { RuleBatch } from "../../../../src/parsing/parser/index.types";

class BatchedDoc {
  batches: RuleBatch[] = [];
  #global: Global;

  constructor(global: Global) {
    this.#global = global;
    this.batches = [];
  }

  addBatch(batch: RuleBatch) {
    this.batches.push(batch);
  }
}

export { BatchedDoc };
