import type { SourceFile } from "typescript";
import ts from "typescript";
import { opts } from "./options";
import path from "path";
import { codeFrameColumns } from "@babel/code-frame";
import { getChalk } from "@babel/highlight";

import { printErrorMessage } from "./errors/error-message";
import type { ErrorMessage } from "./errors/error-message";

const sourceFile: {
  current: SourceFile | null;
} = { current: null };

export function setSourceFile(file: SourceFile): void {
  sourceFile.current = file;
}

function padDashes(consumedWidth: number) {
  return "-".repeat(Math.max(4, process.stdout.columns - consumedWidth));
}

export function error(node: ts.Node, message: ErrorMessage): void {
  printMessage(node, message, errorPrinter);
}

export function warn(node: ts.Node, message: ErrorMessage): void {
  printMessage(node, message, warningPrinter);
}

export function printMessage(
  node: ts.Node,
  message: ErrorMessage,
  printer: Printer,
): void {
  if (opts().quiet) return;
  const options = {
    highlightCode: true,
    message: printErrorMessage(message),
  };
  const chalk = getChalk(options);
  if (sourceFile.current !== null) {
    const currentSourceFile = sourceFile.current;
    const code = currentSourceFile.text;
    const tsStartLocation = currentSourceFile.getLineAndCharacterOfPosition(
      node.getStart(sourceFile.current),
    );
    const tsEndLocation = currentSourceFile.getLineAndCharacterOfPosition(
      node.getEnd(),
    );
    const babelLocation = {
      start: {
        line: tsStartLocation.line + 1,
        column: tsStartLocation.character + 1,
      },
      end: {
        line: tsEndLocation.line + 1,
        column: tsEndLocation.character + 1,
      },
    };
    const result = codeFrameColumns(code, babelLocation, options);
    const position = `:${babelLocation.start.line}:${babelLocation.start.column}`;
    const fileName = path.relative(process.cwd(), currentSourceFile.fileName);
    printer(chalk, fileName, position);
    console.log("\n");
    console.log(result);
    console.log("\n");
  } else {
    console.log(printErrorMessage(message));
  }
}

type Printer = (chalk: any, fileName: string, position: string) => void;

function warningPrinter(chalk: any, fileName: string, position: string) {
  console.log(
    chalk.yellow.bold(
      `Warning ${padDashes(
        7 + fileName.length + position.length,
      )} ${fileName}${position}`,
    ),
  );
}

function errorPrinter(chalk: any, fileName: string, position: string) {
  console.log(
    chalk.red.bold(
      `Error ${padDashes(
        7 + fileName.length + position.length,
      )} ${fileName}${position}`,
    ),
  );
}
