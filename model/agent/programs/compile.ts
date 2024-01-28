import * as commands from "@/model/agent/commands";
import * as parse from "./parse";
import { AgentStateMachine, NamedRegisters } from "./AgentStateMachine";
import { SourceMap } from ".";

export function compileRefTerm(token: parse.RefToken, sourceMap?: SourceMap): commands.RefTerm {
  const term = { type: "ref", register: token.symbol } as const;
  sourceMap?.set(term, token.start);
  return term;
}

export function compileComparisonTerm(token: parse.ComparisonToken, sourceMap?: SourceMap): commands.ComparisonTerm {
  const term = { type: "comparison", comparison: token.symbol } as const;
  sourceMap?.set(term, token.start);
  return term;
}

export function compileOperand(token: parse.Token, sourceMap?: SourceMap): commands.Term {
  if (parse.isRefToken(token)) {
    return compileRefTerm(token);
  }

  if (parse.isComparisonToken(token)) {
    return compileComparisonTerm(token);
  }

  const term = { type: "literal", value: token.symbol } as const;
  sourceMap?.set(term, token.start);
  return term;
}

export function compileStatement(statement: parse.Statement, sourceMap?: SourceMap): commands.Command {
  const instructionToken = statement.tokens[0];
  if (!commands.isInstruction(instructionToken.symbol)) {
    throw new Error(`unrecognized instruction: ${instructionToken.symbol}`);
  }

  // Handle special statements
  if (parse.isTestStatement(statement)) {
    const command = compileTest(statement);
    sourceMap?.set(command, statement.start);
    return command;
  }

  const command = compileOtherStatement(statement);
  sourceMap?.set(command, statement.start);
  return command;
}

function compileOtherStatement(statement: parse.Statement): commands.Command {
  const [instructionToken, ...operandTokens] = statement.tokens;

  const operands = operandTokens.map((token) => compileOperand(token));

  switch (instructionToken.symbol) {
    case commands.Instructions.echo:
      return compileEcho(operands);

    case commands.Instructions.go:
      return compileGo(operands);

    case commands.Instructions.move:
      return compileMove(operands);

    // TODO: setCursor isn't variadic
    case commands.Instructions.setCursor:
      return compileCursor(operands);

    default:
      throw new Error(`i'm dumb and can't compile a ${instructionToken.symbol}`);
  }
}

export function compileEcho(operands: commands.Term[]): commands.EchoCommand {
  return {
    instruction: commands.Instructions.echo,
    operands: operands
  };
}

export function compileGo(operands: commands.Term[]): commands.GoCommand {
  if (operands.length !== 1) {
    throw new Error(`${commands.Instructions.go} takes 1 operand`);
  }

  return {
    instruction: commands.Instructions.go,
    state: operands[0]
  };
}

export function compileMove(operands: commands.Term[]): commands.MoveCommand {
  if (operands.length !== 1) {
    throw new Error(`${commands.Instructions.move} takes 1 operand`);
  }

  return {
    instruction: commands.Instructions.move,
    edgeName: operands[0],
  };
}

const DEFAULT_TEST_OUTPUT = { type: "ref", register: NamedRegisters.cursor } as const;

export function compileTest(statement: parse.TestStatement): commands.TestCommand {
  const [_instruction, op1, op2, op3, op4] = statement.tokens;

  if (parse.isComparisonToken(op2)) {
    const leftOperand = compileOperand(op1);
    const comparison = compileComparisonTerm(op2);
    const rightOperand = compileOperand(op3!);
    const output = parse.isRefToken(op4)
      ? compileRefTerm(op4)
      : DEFAULT_TEST_OUTPUT;

    return {
      instruction: "test",
      leftOperand,
      comparison,
      rightOperand,
      output
    };
  }

  const output = parse.isRefToken(op2)
    ? compileRefTerm(op2)
    : DEFAULT_TEST_OUTPUT;

  return {
    instruction: "test",
    leftOperand: compileOperand(op1),
    output
  };
}


// TODO: bad
export function compileCursor(operands: commands.Term[]): commands.SetCursorCommand {
  if (operands.length !== 1) {
    throw new Error(`SetCursorCommand takes 1 argument, got ${operands.length}`);
  }

  const op = operands[0];
  if (op.type !== "literal") {
    throw new Error(`SetCursorCommand takes 1 literal argument, got argument of type ${op.type}`);
  }

  return {
    instruction: "curs",
    offset: parseInt(op.value!),
    relative: true
  };
}

/**
 * Take a program and turn it into a set of behaviors for an `Agent`
 */
export function compile(program: parse.Program): AgentStateMachine {
  const procedures = new Map<string, commands.Procedure>();
  const sourceMap = new Map<commands.Command | commands.Procedure | commands.Term, parse.LineAndColumn>();

  let currentStateName: string | undefined = undefined;
  let currentProcedure: commands.Procedure | undefined = undefined;

  for (const statement of program.statements) {
    const [instruction, ...operands] = statement.tokens;

    if (instruction.symbol === parse.Keywords.def) {
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

    const command = compileStatement(statement, sourceMap);
    currentProcedure.commands.push(command);
  }

  return {
    program,
    procedures,
    sourceMap
  };
}

export default compile;
