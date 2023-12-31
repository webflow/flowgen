import { compiler, beautify } from "..";
import "../test-matchers";

it("should handle exported interfaces", () => {
  const ts = `export interface UnaryFunction<T, R> {
    (source: T): R;
  }
`;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot();
  expect(result).toBeValidFlowTypeDeclarations();
});

it("should handle exported interfaces within a module", () => {
  const ts = `declare module "my-module" {
    export interface UnaryFunction<T, R> {
      (source: T): R;
    }
  }
`;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot();
  expect(result).toBeValidFlowTypeDeclarations();
});
