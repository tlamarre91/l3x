import { Observable } from "rxjs";
import * as commands from "@/model/agent/commands";
import { Instructions } from "@/model/agent/commands";

export const Keywords = {
  def: "def",
  ...commands.Instructions
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

export interface AgentStateMachine {
  program: Program;
  sourceMap: Map<commands.AgentCommand | commands.Procedure, LineAndColumn>;
  procedures: Map<string, commands.Procedure>;
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

export function compileStatement(statement: Statement): commands.AgentCommand {
  const [instruction, ...operands] = statement.tokens;

  if (!commands.isInstruction(instruction.symbol)) {
    throw new Error(`unrecognized instruction: ${instruction.symbol}`);
  }

  const command: commands.AgentCommand = {
    instruction: instruction.symbol
  };

  switch (instruction.symbol) {
    case Instructions.echo:
      command.message = operands.map((token) => token.symbol).join(" ");
      // TODO: handle variables
      break;

    case Instructions.go:
      if (operands.length !== 1) {
        throw new Error(`${Instructions.go} takes 1 operand`);
      }

      command.edgeName = operands[0].symbol;
      break;

    case Instructions.test:
      if (operands.length !== 3) {
        throw new Error(`${Instructions.test} takes 3 operands`);
      }
      command.leftOperand = operands[0].symbol;
      command.comparison = operands[1].symbol;
      command.rightOperand = operands[2].symbol;

    default:
      throw new Error(`i'm dumb and can't compile a ${instruction.symbol} or anything really`);
  }

  return command;
}

export function compile(program: Program): AgentStateMachine {
  const procedures = new Map<string, commands.Procedure>();
  const sourceMap = new Map<commands.AgentCommand | commands.Procedure, LineAndColumn>();

  let currentStateName: string | undefined = undefined;
  // let currentlyCompilingStateCommands: commands.AgentCommand[] | undefined = undefined;
  let currentProcedure: commands.Procedure | undefined = undefined;

  for (const statement of program.statements) {
    const [instruction, ...operands] = statement.tokens;

    if (instruction.symbol === Keywords.def) {
      if (operands.length !== 1) {
        throw new Error("def takes 1 operand");
      }

      currentStateName = operands[0].symbol;
      if (procedures.has(currentStateName)) {
        throw new Error(`multiple definitions for state ${currentStateName}`);
      }

      currentProcedure = {
        name: currentStateName,
        commands: [],
      };

      procedures.set(currentStateName, currentProcedure);
      sourceMap.set(currentProcedure, statement.start);

      continue;
    }

    if (currentProcedure == null) {
      throw new Error("statement is not part of a state definition");
    }

    const command = compileStatement(statement);
    currentProcedure.commands.push(command);
    sourceMap.set(command, statement.start);
  }

  return {
    program,
    procedures,
    sourceMap
  };
}
