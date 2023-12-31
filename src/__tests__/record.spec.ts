import { compiler, beautify } from "..";
import dedent from "dedent";
import "../test-matchers";

it("should handle immutable Record import", () => {
  const ts = dedent`
    declare module "@packages/systems/core/records/SyncState" {
      import { Record } from 'immutable';
      export const SyncState: Record.Class;
    }
  `;

  const flow = dedent`
    declare module "@packages/systems/core/records/SyncState" {
      import type { Record } from "immutable";
    
      declare export var SyncState: Record.Class;
    }
  `;

  const result = compiler.compileDefinitionString(ts, { quiet: true });

  expect(beautify(result)).toBe(beautify(flow));
  // throws because `immutable` is not available:
  // expect(result).toBeValidFlowTypeDeclarations();
});

it("should handle renamed immutable Record import", () => {
  const ts = dedent`
    declare module "@packages/systems/core/records/SyncState" {
      import { Record as ImmRecord } from 'immutable';
      export const SyncState: ImmRecord.Class;
    }
  `;

  const flow = dedent`
    declare module "@packages/systems/core/records/SyncState" {
      import type { Record as ImmRecord } from "immutable";

      declare export var SyncState: ImmRecord.Class;
    }
  `;

  const result = compiler.compileDefinitionString(ts, { quiet: true });

  expect(beautify(result)).toBe(beautify(flow));
  // throws because `immutable` is not available:
  // expect(result).toBeValidFlowTypeDeclarations();
});

it("should handle immutable Record.Factory import", () => {
  const ts = dedent`
    declare module "@packages/systems/core/records/SyncState" {
      import { type Record } from 'immutable';
      export const SyncState: Record.Factory;
    }
  `;

  const flow = dedent`
    declare module "@packages/systems/core/records/SyncState" {
      import type { Record, RecordFactory } from "immutable";

      declare export var SyncState: RecordFactory;
    }
  `;

  const result = compiler.compileDefinitionString(ts, { quiet: true });

  expect(beautify(result)).toBe(beautify(flow));
  // throws because `immutable` is not available:
  // expect(result).toBeValidFlowTypeDeclarations();
});

it("should import RecordFactory only once", () => {
  const ts = dedent`
    declare module "@packages/systems/core/records/SyncState" {
      import { type Record } from 'immutable';
      import { type List } from 'immutable';
      export const SyncState: Record.Factory;
    }
  `;

  const flow = dedent`
    declare module "@packages/systems/core/records/SyncState" {
      import type { Record, RecordFactory } from "immutable";

      import type { List } from 'immutable';

      declare export var SyncState: RecordFactory;
    }
  `;

  const result = compiler.compileDefinitionString(ts, { quiet: true });

  expect(beautify(result)).toBe(beautify(flow));
  // throws because `immutable` is not available:
  // expect(result).toBeValidFlowTypeDeclarations();
});
