import type { RawNode } from "./node";
import Node from "./node";
import * as printers from "../printers";
import { checker } from "../checker";
import * as ts from "typescript";

const TYPE_KEYWORD = "type";

export default class Import extends Node {
  constructor(node: RawNode) {
    super(node);
  }

  print(): string {
    //TODO: move to printers
    if (this.raw.importClause) {
      const bindings = this.raw.importClause.namedBindings;
      const name = this.raw.importClause.name;
      const isTypeImport = this.raw.importClause.isTypeOnly;

      // in Typescript, you can use "import type" on an enum
      // however, flowgen converts typescript enums to regular objects
      // so that means "import type" would fail on them (can't import type a regular object)
      // instead, we mimic this by using the import { typeof } notation
      const extractEnumTypeImports = elements => {
        const enumElems = [];
        const regularElems = [];
        for (const elem of elements) {
          // if we're not using import type, no need to do anything special
          if (!isTypeImport) {
            regularElems.push(elem);
            continue;
          }
          const elemSymbol = checker.current.getTypeAtLocation(elem).symbol;
          const isEnum =
            elemSymbol &&
            elemSymbol.declarations &&
            elemSymbol.declarations[0].kind === ts.SyntaxKind.EnumDeclaration;
          if (isEnum) {
            enumElems.push(elem);
          } else {
            regularElems.push(elem);
          }
        }
        return { enumElems, regularElems };
      };

      const printTypeImports = typeImports => {
        return `import type {
              ${typeImports.map(node => printers.node.printType(node))}
            } from '${this.raw.moduleSpecifier.text}';\n`;
      };

      if (name && bindings) {
        const elements = bindings.elements;
        if (elements) {
          const { enumElems, regularElems } = extractEnumTypeImports(elements);
          const { typeImports, regularImports } =
            collectInlineTypeImports(regularElems);

          let result = "";
          if (regularImports.length > 0) {
            result += `import${
              this.module === "root" && !isTypeImport ? "" : " type"
            } ${name.text}, {
            ${regularImports.map(node => printers.node.printType(node))}
            } from '${this.raw.moduleSpecifier.text}';\n`;
          }
          if (enumElems.length > 0) {
            result += `import typeof ${name.text}, {
              ${enumElems.map(node => printers.node.printType(node))}
            } from '${this.raw.moduleSpecifier.text}';\n`;
          }
          if (typeImports.length > 0) {
            result += printTypeImports(typeImports);
          }
          return result;
        } else {
          const namespace = bindings.name.text;
          return `import${this.module === "root" ? "" : " typeof"} ${
            name.text
          }, * as ${namespace} from '${this.raw.moduleSpecifier.text}';\n`;
        }
      }
      if (name) {
        return `import${this.module === "root" ? "" : " typeof"} ${
          name.text
        } from '${this.raw.moduleSpecifier.text}';\n`;
      }
      if (bindings) {
        const elements = bindings.elements;
        if (elements) {
          const { enumElems, regularElems } = extractEnumTypeImports(elements);
          const { typeImports, regularImports } =
            collectInlineTypeImports(regularElems);

          let result = "";
          if (regularImports.length > 0) {
            result += `import${
              this.module === "root" && !isTypeImport ? "" : " type"
            } {
            ${regularImports.map(node => printers.node.printType(node))}
            } from '${this.raw.moduleSpecifier.text}';\n`;
          }
          if (enumElems.length > 0) {
            result += `import typeof {
              ${enumElems.map(node => printers.node.printType(node))}
            } from '${this.raw.moduleSpecifier.text}';\n`;
          }
          if (typeImports.length > 0) {
            result += printTypeImports(typeImports);
          }
          return result;
        } else {
          const name = bindings.name.text;
          return `import${
            this.module === "root" ? "" : " typeof"
          } * as ${name} from '${this.raw.moduleSpecifier.text}';\n`;
        }
      }
    }
    return this.module === "root"
      ? `import '${this.raw.moduleSpecifier.text}';\n`
      : "";
  }
}

// If we're not doing a top-level `import type`
// we can still have a `type` keyword in the import statement,
// which means we need to split the imports into two groups:
// - type imports
// - regular imports
const collectInlineTypeImports = elements => {
  let prevElementIsTypeKeyword = false;
  const typeImports = [];
  const regularImports = [];
  for (const elem of elements) {
    if (elem.name.escapedText === TYPE_KEYWORD) {
      prevElementIsTypeKeyword = true;
      continue;
    }
    if (prevElementIsTypeKeyword) {
      typeImports.push(elem);
    } else {
      regularImports.push(elem);
    }

    prevElementIsTypeKeyword = false;
  }

  return { typeImports, regularImports };
};
