import dedent from "dedent";
import prettier from "prettier";

export default function beautify(str: string): string {
  return prettier.format(str, { parser: "babel-flow" });
}

export function tsBeautify(value: string): string {
  return prettier.format(dedent(value), { parser: "typescript" });
}

export function flBeautify(value: string): string {
  return prettier.format(dedent(value), { parser: "babel-flow" });
}
