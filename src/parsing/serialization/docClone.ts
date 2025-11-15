import type { Global } from "../../index.types";
import { MEDIA_RULE_TYPE, STYLE_RULE_TYPE } from "../../index.types";

class DocClone {
  sheets: SheetClone[] = [];
  #global: Global;

  constructor(global: Global) {
    this.#global = global;
  }

  addSheet() {
    const sheet = new SheetClone(this.#global);
    this.sheets.push(sheet);
    return sheet;
  }
}

class SheetClone {
  rules: RuleClone[] = [];
  #global: Global;

  constructor(global: Global) {
    this.#global = global;
  }

  addStyleRule() {
    const rule = new StyleRuleClone(this.#global);
    this.rules.push(rule);
    return rule;
  }

  addMediaRule() {
    const rule = new MediaRuleClone(this.#global);
    this.rules.push(rule);
    return rule;
  }
}

class RuleClone {
  type: typeof STYLE_RULE_TYPE | typeof MEDIA_RULE_TYPE;
  // @ts-ignore
  #global: Global;

  constructor(
    type: typeof STYLE_RULE_TYPE | typeof MEDIA_RULE_TYPE,
    global: Global
  ) {
    this.#global = global;
    this.type = type;
  }
  get global() {
    return this.#global;
  }
}

class StyleRuleClone extends RuleClone {
  selector: string = "";
  style: Record<string, string> = {};
  specialProps: Record<string, string> = {};
  orderID: number = 0;

  constructor(global: Global) {
    super(STYLE_RULE_TYPE, global);
  }
}

class MediaRuleClone extends RuleClone {
  minWidth: number = 0;
  rules: StyleRuleClone[] = [];

  constructor(global: Global) {
    super(MEDIA_RULE_TYPE, global);
  }

  addStyleRule() {
    const rule = new StyleRuleClone(this.global);
    this.rules.push(rule);
    return rule;
  }
}

export { DocClone, SheetClone, RuleClone, StyleRuleClone, MediaRuleClone };
