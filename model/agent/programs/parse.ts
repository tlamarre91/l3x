/**
 * Parse l3x programs!
 */

import { L3xError } from "@/model/errors";
import { Comparison, Instruction, Instructions, isComparison, isInstruction } from "./commands";
import { NamedRegister, NamedRegisters, isNamedRegister } from "./DataDeque";

export class ParseError extends L3xError {
  name = "ParseError";

  constructor(
    public description: string,
    public location: LineAndColumn
  ) {
    const { line, column } = location;
    super(`Parse error at line ${line + 1}, column ${column + 1}: ${description}`);
  }

  withContext(code: string): string {
    // TODO: !! not good. should probably pass code context when error is thrown
    const codeLines = code.split("\n");
    const { line, column } = this.location;
    const codeLine = codeLines[line];
    const pointer = " ".repeat(column) + "^";
    const out = [
      codeLine,
      pointer,
      this.message
    ].join("\n");
    return out;
  }
}

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

export type StatementType = Instruction | "def";

export function isStatementType(symbol: string): symbol is StatementType {
  return isInstruction(symbol) || symbol === "def";
}

export interface Statement {
  type: StatementType;
  start: LineAndColumn;
  tokens: Token[];
}

export interface TestStatement extends Statement {
  type: typeof Instructions.test;
  tokens:
    | [InstructionToken, Token]
    | [InstructionToken, Token, RefToken]
    | [InstructionToken, Token, ComparisonToken, Token]
    | [InstructionToken, Token, ComparisonToken, Token, RefToken];
}

/** Don't use this if you haven't already parsed the statement; it doesn't validate */
export function isTestStatement(statement: Statement): statement is TestStatement {
  return statement.type === "test";
}

/** Return `true` if `statement` is a valid `TestStatement`, throw otherwise */
export function validateTestStatement(statement: Statement): statement is TestStatement {
  const { tokens, start } = statement;
  if (tokens[0].symbol !== "test") {
    throw new ParseError(`Expected "test", got ${tokens[0].symbol}`, tokens[0].start);
  }

  if (tokens.length === 2) {
    return true; // TODO: ??? is this enough
  }

  if (tokens.length === 3) {
    const outputToken = tokens[2];

    const valid = isNamedRegister(outputToken.symbol); // TODO: ??? is this enough
    if (!valid) {
      throw new ParseError(`Expected named register, got ${outputToken.symbol}`, outputToken.start);
    }

    return true;
  }

  if (tokens.length === 4 || tokens.length === 5) {
    const comparisonToken = tokens[2];

    const comparisonValid = isComparisonToken(comparisonToken);
    if (!comparisonValid) {
      throw new ParseError(`Expected comparison, got ${comparisonToken.symbol}`, comparisonToken.start);
    }

    const outputValid = tokens.length === 4 || isRefToken(tokens[4]);
    if (!outputValid) {
      throw new ParseError(
        `Expected named register or nothing, got ${tokens[4].symbol}`,
        tokens[4].start
      );
    }

    return true;
  }

  throw new ParseError(`Expected 1, 2, 3, or 4 arguments, got ${tokens.length - 1}`, start);
}

export interface EchoStatement extends Statement {
  type: typeof Instructions.echo;
}

export function isEchoStatement(statement: Statement): statement is EchoStatement {
  return statement.type === Instructions.echo;
}

export interface GoStatement extends Statement {
  type: typeof Instructions.go;
}

export function isGoStatement(statement: Statement): statement is GoStatement {
  return statement.type === Instructions.go;
}

export interface GoIfTrueStatement extends Statement {
  type: typeof Instructions.goIfTrue;
}

export function isGoIfTrueStatement(statement: Statement): statement is GoStatement {
  return statement.type === Instructions.goIfTrue;
}

export interface GoIfFalseStatement extends Statement {
  type: typeof Instructions.goIfFalse;
}

export function isGoIfFalseStatement(statement: Statement): statement is GoStatement {
  return statement.type === Instructions.goIfFalse;
}

export interface MoveStatement extends Statement {
  type: typeof Instructions.move;
}

export function isMoveStatement(statement: Statement): statement is MoveStatement {
  return statement.type === Instructions.move;
}

export interface SetCursorStatement extends Statement {
  type: typeof Instructions.setCursor;
}

export function isSetCursorStatement(statement: Statement): statement is SetCursorStatement {
  return statement.type === Instructions.setCursor;
}

export interface WriteStatement extends Statement {
  type: typeof Instructions.write;
  tokens:
    | [InstructionToken, Token]
    | [InstructionToken, Token, RefToken];
}

/** Don't use this if you haven't already parsed the statement; it doesn't validate */
export function isWriteStatement(statement: Statement): statement is WriteStatement {
  return statement.type === Instructions.write;
}

/** Return `true` if `statement` is a valid `WriteStatement`, throw otherwise */
export function validateWriteStatement(statement: Statement): statement is WriteStatement {
  const { tokens, start } = statement;
  const [instruction, ...operands] = tokens;

  if (instruction.symbol !== Instructions.write) {
    throw new ParseError(`Expected "write", got ${instruction.symbol}`, instruction.start);
  }

  if (operands.length === 1) {
    return true;
  }

  if (operands.length !== 2) {
    throw new ParseError(`Expected 1 or 2 arguments, got ${tokens.length - 1}`, start);
  }

  const outputToken = operands[1];
  if (!isRefToken(outputToken)) {
    throw new ParseError(
      `Expected named register or nothing, got ${outputToken.symbol}`,
      outputToken.start
    );
  }

  return true;
}

export interface Program {
  statements: Statement[];
  codeLines: string[];
}

/** basically just throw if `symbol` starts with "$" but isn't a named register */
export function validateSymbol(symbol: string, start: LineAndColumn): void {
  if (symbol.startsWith("$") && !(isNamedRegister(symbol))) {
    throw new ParseError(`Expected named register, got ${symbol}`, start);
  }
}

export function parseStatement(line: string, lineNumber: number): Statement | undefined {
  // TODO: support any whitespace but make sure to keep character count
  const splitOnSpace = line.split(" ");

  if (splitOnSpace.length === 0) {
    return;
  }

  let currentColumn = 0;
  let lineStartColumn = 0;

  const tokens = new Array<Token>();

  for (const symbol of splitOnSpace) {
    const tokenColumn = currentColumn;
    currentColumn += symbol.length + 1; // add 1 because we split on " "

    if (symbol.length === 0) {
      // handle consecutive whitespace
      lineStartColumn = currentColumn;
      continue;
    }

    const tokenStart: LineAndColumn = {
      line: lineNumber,
      column: tokenColumn
    }

    validateSymbol(symbol, tokenStart);

    if (tokens.length === 0 && !isStatementType(symbol)) {
      throw new ParseError(`First token must be a statement type; got ${symbol}`, tokenStart);
    }

    const token: Token = {
      start: tokenStart,
      symbol
    };

    tokens.push(token);
  }

  if (tokens.length === 0) {
    return;
  }

  const statement = {
    // TODO: for first token, don't append to tokens so we don't store the instruction twice
    type: tokens[0].symbol as StatementType,
    tokens,
    start: {
      line: lineNumber,
      column: lineStartColumn
    },
  } satisfies Statement;

  if (statement.tokens[0].symbol === "test") {
    validateTestStatement(statement);
    statement.type = "test";
  }

  if (statement.tokens[0].symbol === "write") {
    validateWriteStatement(statement);
    statement.type = "write";
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
