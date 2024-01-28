import { Comparison, Instruction, Instructions, isComparison } from "@/model/agent/commands";
import { NamedRegister, NamedRegisters, isNamedRegister } from "./AgentStateMachine";

export const Keywords = {
  def: "def",
  ...Instructions,
  ...NamedRegisters
} as const;

export type Keyword = typeof Keywords[keyof typeof Keywords];

export function isKeyword(s: string): s is Keyword {
  return Object.values(Keywords).includes(s as Keyword);
}

export type LineAndColumn = { line: number, column: number };

export interface Token {
  start: LineAndColumn;
  symbol: string;
}

export interface InstructionToken extends Token {
  symbol: Instruction;
}

export interface RefToken extends Token {
  symbol: NamedRegister;
}

export function isRefToken(token: Token | undefined): token is RefToken {
  return isNamedRegister(token?.symbol);
}

export interface ComparisonToken extends Token {
  symbol: Comparison;
}

export function isComparisonToken(token: Token | undefined): token is ComparisonToken {
  return isComparison(token?.symbol);
}

export interface Statement {
  type?: "test" | undefined; // TODO: more types
  start: LineAndColumn;
  tokens: Token[];
}

export interface TestStatement extends Statement {
  tokens:
    | [InstructionToken, Token]
    | [InstructionToken, Token, RefToken]
    | [InstructionToken, Token, ComparisonToken, Token]
    | [InstructionToken, Token, ComparisonToken, Token, RefToken];
}

/**
 * Don't use this if you haven't already parsed the statement; it doesn't validate
 */
export function isTestStatement(statement: Statement): statement is TestStatement {
  return statement.type === "test";
}

export function validateTestStatement(statement: Statement): statement is TestStatement {
  if (statement.tokens[0].symbol !== "test") {
    throw new Error(`Expected instruction "test" at column ${statement.tokens[0].start.column}, got ${statement.tokens[0].symbol}`);
  }

  if (statement.tokens.length === 2) {
    return true; // TODO: ??? is this enough
  }

  if (statement.tokens.length === 3) {
    const outputToken = statement.tokens[2];

    const valid = isNamedRegister(outputToken.symbol); // TODO: ??? is this enough
    if (!valid) {
      throw new Error(`Expected named register at column ${outputToken.start.column}, got ${outputToken.symbol}`);
    }

    return true;
  }

  if (statement.tokens.length === 4 || statement.tokens.length === 5) {
    const comparisonToken = statement.tokens[2];

    const comparisonValid = isComparisonToken(comparisonToken);
    if (!comparisonValid) {
      throw new Error(`Expected comparison at column ${comparisonToken.start.column}, got ${comparisonToken.symbol}`);
    }

    const outputValid = statement.tokens.length === 4 || isRefToken(statement.tokens[4]);
    if (!outputValid) {
      throw new Error(`Expected named register or nothing at column ${statement.tokens[5].start.column}, got ${statement.tokens[5].symbol}`);
    }

    return true;
  }

  throw new Error(`Expected 1, 2, 3, or 4 arguments, got ${statement.tokens.length - 1}`);
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

    const token: Token = {
      start: {
        line: lineNumber,
        column
      },
      symbol
    };

    tokens.push(token);
  }

  if (tokens.length === 0) {
    return;
  }

  const statement = {
    start: {
      line: lineNumber,
      column: startColumn
    },
    tokens
  } as Statement;

  if (statement.tokens[0].symbol === "test") {
    validateTestStatement(statement);
    statement.type = "test";
    return statement;
  }

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
