import * as commands from "@/model/agent/commands";
import { Instructions } from "@/model/agent/commands";

export const Keywords = {
  def: "def",
  ...Instructions
} as const;

export type Keyword = typeof Keywords[keyof typeof Keywords];

export function isKeyword(s: string): s is Keyword {
  // TODO: eehhhh
  return Object.hasOwn(Keywords, s);
}

export type LineAndColumn = { line: number, column: number };

export interface Token {
  start: LineAndColumn;
  symbol: string;
}

export interface InstructionToken {
  symbol: commands.Instruction;
}

export interface Statement {
  start: LineAndColumn;
  tokens: Token[];
}

export interface Program {
  statements: Statement[];
  codeLines: string[];
}

export function parseStatement(line: string, lineNumber: number): Statement | undefined {
  // TODO: support any whitespace but make sure to keep character count
  const splitOnSpace = line.split(" ");

  if (splitOnSpace.length === 0) {
    return;
  }

  let currentColumn = 0;
  let startColumn = 0;

  const tokens = new Array<Token>();
  for (const symbol of splitOnSpace) {
    const column = currentColumn;
    currentColumn += symbol.length + 1; // add 1 because we split on " "

    if (symbol.length === 0) {
      startColumn = currentColumn;
      continue;
    }

    if (tokens.length === 0 && !isKeyword(symbol)) {
      throw new Error(`first token must be keyword; got ${symbol}`);
    }

    tokens.push({ start: { line: lineNumber, column }, symbol });
  }

  if (tokens.length === 0) {
    return;
  }

  const statement = { start: { line: lineNumber, column: startColumn }, tokens };
  return statement;
}

export function parse(code: string): Program {
  const codeLines = code.split("\n");
  const statements = new Array<Statement>();

  let lineNumber = 0;

  for (const line of codeLines) {
    const statement = parseStatement(line, lineNumber++);

    if (statement == null) {
      continue;
    }

    statements.push(statement);
  }

  return { statements, codeLines };
}
