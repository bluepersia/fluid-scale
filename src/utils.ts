import { ArithemticOperator } from "./parse/index.types";

function isArithemticOperator(value: string): value is ArithemticOperator {
  return value === "+" || value === "-" || value === "*" || value === "/";
}

export { isArithemticOperator };
