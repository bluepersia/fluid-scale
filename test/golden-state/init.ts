import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";
import { cloneDocumentTemplate, FLUID_PROPERTY_NAMES } from "../../src/clone";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const realProjectsData = [
  {
    htmlFilePath: "eau-de-parfum",
    addCss: ["css/global.css", "css/utils.css", "css/product-card.css"],
  },
];

async function init() {
  const playwrightPages = await Promise.all(
    realProjectsData.map(async ({ htmlFilePath, addCss }) => {
      const finalPath = path.resolve(__dirname, htmlFilePath, "index.html");
      const browser = await chromium.launch();
      const page = await browser.newPage();
      await page.goto(`file://${finalPath}`);

      for (const css of addCss) {
        const cssPath = path.resolve(__dirname, htmlFilePath, css);
        await page.addStyleTag({ path: cssPath });
      }

      return page;
    })
  );

  (globalThis as any).clonedDocuments = await Promise.all(
    playwrightPages.map(async (page) => {
      return await page.evaluate(
        async ({ cloneDocumentTemplate, FLUID_PROPERTY_NAMES }) => {
          const cloneDocument = new Function(
            "document",
            "FLUID_PROPERTY_NAMES",
            cloneDocumentTemplate
          );
          const clonedDocument = cloneDocument(document, FLUID_PROPERTY_NAMES);
          return clonedDocument;
        },
        { cloneDocumentTemplate, FLUID_PROPERTY_NAMES }
      );
    })
  );

  (globalThis as any).playwrightPages = playwrightPages;
}

await init();

export { init, realProjectsData };
