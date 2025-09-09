/** We will parse the CSS document into values that the engine can use to interpolate.
 * We will start by returning the unique set of breakpoints for the project.
 * We extract these from the media queries that have min-width defined.
 */

import { DocumentClone, MediaQueryClone } from "./clone.types";
import { ParsedDocument } from "./parse.types";

function parseCSS(document: DocumentClone): ParsedDocument {
  const breakpoints = new Set<number>();

  for (const sheet of document.styleSheets) {
    for (const rule of sheet.rules) {
      if (rule.type === 4) {
        const mediaRule = rule as MediaQueryClone;
        // Regex explanation: matches (min-width: <number>px)
        const match = mediaRule.media.mediaText.match(
          /\(min-width:\s*(\d+)px\)/
        );
        if (match) breakpoints.add(Number(match[1]));
      }
    }
  }
  return { breakpoints: Array.from(breakpoints) };
}

export { parseCSS };
