function splitBySpaces(value: string): string[] {
  let depth = 0;
  let currentValue = "";
  const result: string[] = [];

  for (const char of value) {
    if (char === " ") {
      if (depth === 0) {
        result.push(currentValue);
        currentValue = "";
      } else {
        currentValue += char;
      }
    } else {
      if (char === "(") {
        depth++;
      } else if (char === ")") {
        depth--;
      }
      currentValue += char;
    }
  }

  if (currentValue) {
    result.push(currentValue);
  }

  return result;
}

export { splitBySpaces };
