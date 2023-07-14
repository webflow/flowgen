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
