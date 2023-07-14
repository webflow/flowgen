import { compiler, beautify, flBeautify } from "..";
import "../test-matchers";

it("should handle exported types", () => {
  const ts = `
    export declare type FactoryOrValue<T> = T | (() => T);
    export type Maybe<T> = {type: 'just', value: T} | {type: 'nothing'}
  `;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot();
  expect(result).toBeValidFlowTypeDeclarations();
});

it("should handle export list syntax", () => {
  const ts = `
    declare type ComplexType = { type: number } | { type: string };
    export type { ComplexType };
    const foo = 5;
    export { foo };
  `;
  const fl = flBeautify(`
    declare type ComplexType = 
      | {
          type: number,
          ...
        }
      | {
          type: string,
          ...
        };
    export type { ComplexType };
    declare var foo: 5;
    declare export { foo };
  `);

  const result = compiler.compileDefinitionString(ts, { quiet: true });

  expect(beautify(result)).toBe(fl);
  expect(result).toBeValidFlowTypeDeclarations();
});

it("should handle inline export list syntax", () => {
  const ts = `
    declare type ComplexType = { type: number } | { type: string };
    const foo = 5;
    export { type ComplexType, foo };
  `;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot();
  expect(result).toBeValidFlowTypeDeclarations();
});
