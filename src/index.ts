import compiler from "./cli/compiler";
import * as beautify from "./cli/beautifier";

export { default as compiler } from "./cli/compiler";

export { default as beautify } from "./cli/beautifier";

export const tsBeautify = beautify.tsBeautify;
export const flBeautify = beautify.flBeautify;

export default {
  beautify: beautify.default,
  compiler,
};
