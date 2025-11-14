import fs from "fs";
import path from "path";
import { JSDOM } from "jsdom";

function resolvePath(cssPath: string, htmlFilePath: string) {
  if (/^(https?:)?\/\//.test(cssPath)) {
    // External URL or CDN
    return null;
  }
  if (!cssPath.startsWith("/"))
    return path.resolve(path.dirname(htmlFilePath), cssPath);

  return cssPath;
}

function generateJSDOMDocument(inputFiles: string[]) {
  const cssFiles = inputFiles.filter((file) => file.endsWith(".css"));
  for (const file of inputFiles) {
    const content = fs.readFileSync(file).toString();

    if (file.endsWith(".html"))
      cssFiles.push(
        ...([...content.matchAll(/<link\s+[^>]*href=["']([^"']+\.css)["']/g)]
          .map((m) => resolvePath(m[1], file))
          .filter((m) => m !== null) as string[])
      );
  }
  let html = "<!DOCTYPE html><html><head>";

  for (const cssFile of cssFiles) {
    const cssContent = fs.readFileSync(cssFile, "utf8");
    html += `<style>${cssContent}</style>`;
  }

  html += "</head><body></body></html>";

  const dom = new JSDOM(html);
  const document = dom.window.document;

  return document;
}

export { generateJSDOMDocument, resolvePath };
