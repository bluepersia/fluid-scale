import { chromium } from "playwright";
import type { Browser, Page } from "playwright";
import serveStatic from "serve-static";
import finalhandler from "finalhandler";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import type { PlaywrightBlueprint, PlaywrightPage } from "./index.types";
import { generateJSDOMDocument } from "../src/parsing/jsdom/jsonBuilder";
import { wrapAll as wrapAllCloneDoc } from "./parsing/serialization/docCloner/goldSight";

wrapAllCloneDoc();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class IntersectionObserverMock {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

(globalThis as any).IntersectionObserver = IntersectionObserverMock;

const realProjectsData: PlaywrightBlueprint[] = [
  {
    htmlFilePath: "golden-master/0",
    addCss: ["css/global.css", "css/utils.css", "css/product-card.css"],
    useServer: true,
  },
];

const JSDOMDocs = realProjectsData.map(({ htmlFilePath }, index) => {
  const finalPath = path.resolve(__dirname, htmlFilePath, "index.html");
  return { doc: generateJSDOMDocument([finalPath]), index };
});

async function startStaticServer(folder: string) {
  const serve = serveStatic(path.resolve(folder), { index: ["index.html"] });
  const serveBundle = serveStatic(path.resolve(__dirname, "../bundle/dist"));
  const server = http.createServer((req, res) => {
    serve(req, res, (err: any) => {
      if (err) return finalhandler(req, res)(err);

      serveBundle(req, res, finalhandler(req, res));
    });
  });

  const port = await new Promise<void>((resolve) =>
    server.listen(0, () => {
      const port = (server.address() as any).port;
      resolve(port);
    })
  );
  return {
    url: `http://localhost:${port}`,
    close: () => server.close(),
  };
}

async function startBrowserPage(blueprint?: PlaywrightBlueprint) {
  const { htmlFilePath, useServer } = blueprint ?? {};

  const browser = await chromium.launch();
  const page = await browser.newPage();
  let server;

  if (useServer && htmlFilePath) {
    server = await startStaticServer(path.resolve(__dirname, htmlFilePath));
    await page.goto(`${server.url}/`);
  } else {
    const finalPath = htmlFilePath
      ? path.resolve(__dirname, htmlFilePath, "index.html")
      : "";
    if (finalPath) await page.goto(`file://${finalPath}`);
  }
  await onLoadBrowserPage(page, blueprint);

  return { page, browser, blueprint, server };
}

async function onLoadBrowserPage(page: Page, blueprint?: PlaywrightBlueprint) {
  const { htmlFilePath, addCss, useServer } = blueprint ?? {};

  if (addCss && htmlFilePath && !useServer) {
    for (const css of addCss) {
      const cssPath = path.resolve(__dirname, htmlFilePath, css);
      await page.addStyleTag({ path: cssPath });
    }
  }

  // Inject the IIFE bundle and expose cloneDocument on window for tests
  const clonerBundlePath = path.resolve(__dirname, "../bundle/dist/bundle.js");
  page.on("console", (msg) => {
    const text = msg.text();
    if (text.includes("Failed to load resource")) return;
    console.log("BROWSER LOG:", text);
  });
  page.on("pageerror", (err) => {
    console.log("PAGE ERROR:", err);
  });
  if (!useServer) await page.addScriptTag({ path: clonerBundlePath });
  await page.waitForFunction(() => (window as any).FluidScale !== undefined);
  await page.evaluate(() => {
    (window as any).dev = true;
    // @ts-expect-error global from IIFE bundle
    window.cloneDoc = window.FluidScale.cloneDoc;

    // prettier-ignore
    // @ts-expect-error global from IIFE bundle
    window.docClonerAssertionMaster = window.FluidScale.docClonerAssertionMaster;

    // @ts-expect-error global from IIFE bundle
    window.EventBus = window.FluidScale.EventBus;

    // @ts-expect-error global from IIFE bundle
    window.makeEventContext = window.FluidScale.makeEventContext;

    // @ts-expect-error global from IIFE bundle
    window.makeDefaultGlobal = window.FluidScale.makeDefaultGlobal;
  });
}

async function closeBrowserPage({
  browser,
  page,
  server,
}: {
  browser: Browser;
  page: Page;
  server: {
    url: string;
    close: () => void;
  };
}) {
  await page.close();
  await browser.close();
  if (server) await server.close();
}

async function initPlaywrightPages(): Promise<PlaywrightPage[]> {
  return await Promise.all(
    realProjectsData.map(async ({ htmlFilePath, addCss, useServer }) => {
      return await startBrowserPage({ htmlFilePath, addCss, useServer });
    })
  );
}

async function teardownPlaywrightPages(
  playwrightPages: { page: Page; browser: Browser }[]
) {
  for (const { page, browser } of playwrightPages) {
    await page.close(); // close page first
    await browser.close(); // then close browser
  }
}

export {
  initPlaywrightPages,
  teardownPlaywrightPages,
  startBrowserPage,
  closeBrowserPage,
  onLoadBrowserPage,
  JSDOMDocs,
};
