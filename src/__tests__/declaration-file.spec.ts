import { compiler, beautify } from "..";
import "../test-matchers";

it("should handle basic keywords", () => {
  const ts = `
declare interface A {
  bar: string
}

export declare const ok: number
  `;

  const result = compiler.compileDefinitionString(ts, {
    quiet: true,
    asModule: "test",
  });
  expect(beautify(result)).toMatchSnapshot();
  expect(result).toBeValidFlowTypeDeclarations();
});

it("should handle basic keywords  cll", () => {
  const ts = `
  declare module 'test' {
    interface A {
      bar: string
    }
    export const ok: number
  }`;

  const result = compiler.compileDefinitionString(ts, {
    quiet: true,
    asModule: "test",
  });
  expect(beautify(result)).toMatchSnapshot();
  expect(result).toBeValidFlowTypeDeclarations();
});

it("should handle re-exporting from across modules", () => {
  const ts = `
    declare module '@packages/a' {
      export type OriginalExport = {foo: string};
    }
    declare module '@packages/b' {
      export type {OriginalExport} from '@packages/a';
    }
  `;

  const flow = beautify(`
    declare module "@packages/a" {
      declare export type OriginalExport = {
        foo: string,
        ...
      };
    }

    declare module "@packages/b" {
      declare export { OriginalExport } from "@packages/a";
    }
  `);

  const result = compiler.compileDefinitionString(ts, { quiet: true });

  expect(beautify(result)).toBe(flow);
});
