type DocumentClone = {
  styleSheets: StyleSheetClone[];
};

type StyleSheetClone = {
  rules: RuleClone[];
};

type RuleClone = {
  type: 1 | 4;
};

type MediaQueryClone = RuleClone & {
  type: 4;
  media: { mediaText: string };
  rules: StyleRuleClone[];
};

type StyleRuleClone = RuleClone & {
  type: 1;
  selector: string;
  properties: {
    [name: string]: string;
  };
};

export {
  DocumentClone,
  RuleClone,
  MediaQueryClone,
  StyleRuleClone,
  StyleSheetClone,
};
