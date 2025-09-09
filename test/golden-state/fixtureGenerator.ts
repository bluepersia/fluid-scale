import fs from "fs";
import { realProjectsData } from "./init";

for (const [index, project] of realProjectsData.entries()) {
  const clonedDocument = (globalThis as any).clonedDocuments[index];
  const { htmlFilePath } = project;
  const path = `./test/golden-state/${htmlFilePath}`;
  fs.mkdirSync(path, { recursive: true });
  fs.writeFileSync(
    `${path}/documentClone.json`,
    JSON.stringify(clonedDocument, null, 2),
    { encoding: "utf-8" }
  );
}
