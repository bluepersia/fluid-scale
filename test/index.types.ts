import type { Browser, Page } from "playwright";

type PlaywrightPage = {
  page: Page;
  browser: Browser;
  blueprint?: PlaywrightBlueprint;
};

type PlaywrightBlueprint = {
  useServer?: boolean;
  htmlFilePath: string;
  addCss: string[];
};

type Master = {
  index: number;
  step?: number;
};

export type { PlaywrightPage, PlaywrightBlueprint, Master };
