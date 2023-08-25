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

describe("should handle creating a type from an imported object literal across modules", () => {
  it("type is keys", () => {
    const ts = `
      declare module '@packages/a' {
        export const foo: {
          readonly 'a': "A";
          readonly 'b': "B";
        };
      }
      declare module '@packages/b' {
        import { foo } from "@packages/a";
        export type FooKeys = keyof typeof foo;
      }
    `;

    const flow = beautify(`
      declare module "@packages/a" {
        declare export var foo: {
          +a: "A",
          +b: "B",
          ...
        };
      }

      declare module "@packages/b" {
        import type { foo } from "@packages/a";

        declare export type FooKeys = $Keys<foo>;
      }
    `);

    const result = compiler.compileDefinitionString(ts, { quiet: true });

    expect(beautify(result)).toBe(flow);
  });

  it("type is values", () => {
    const ts = `
      declare module '@packages/a' {
        export const foo: {
          readonly a: "A";
        };
      }
      declare module '@packages/b' {
        import { foo } from "@packages/a";
        export type fooType = (typeof foo)[keyof typeof foo] | null | undefined;
      }
    `;

    const flow = beautify(`
      declare module "@packages/a" {
        declare export var foo: {
          +a: "A",
          ...
        };
      }

      declare module "@packages/b" {
        import type { foo } from "@packages/a";

        declare export type fooType = $Values<foo> | null | void;
      }
    `);

    const result = compiler.compileDefinitionString(ts, { quiet: true });

    expect(beautify(result)).toBe(flow);
  });
});
