import * as commands from "./commands";
import * as parse from "./parse";
import { AgentStateMachine } from "./AgentStateMachine";
import { SourceMap } from ".";
import { NamedRegisters } from "./DataDeque";

export function compileRefTerm(token: parse.RefToken, sourceMap: SourceMap | null): commands.RefTerm {
  const term = { type: "ref", register: token.symbol } as const;
  sourceMap?.set(term, token.start);
  return term;
}

export function compileComparisonTerm(token: parse.ComparisonToken, sourceMap: SourceMap | null): commands.ComparisonTerm {
  const term = { type: "comparison", comparison: token.symbol } as const;
  sourceMap?.set(term, token.start);
  return term;
}

// TODO: clean up
export function compileOperand(token: parse.Token, sourceMap: SourceMap | null): commands.Term {
  if (parse.isRefToken(token)) {
    return compileRefTerm(token, sourceMap);
  }

  if (parse.isComparisonToken(token)) {
    return compileComparisonTerm(token, sourceMap);
  }

  const term = { type: "literal", value: token.symbol } as const;
  sourceMap?.set(term, token.start);
  return term;
}

export function compileStatement(statement: parse.Statement, sourceMap: SourceMap | null): commands.Command {
  const instructionToken = statement.tokens[0];
  if (!commands.isInstruction(instructionToken.symbol)) {
    throw new Error(`unrecognized instruction: ${instructionToken.symbol}`);
  }

  // Handle special statements
  if (parse.isTestStatement(statement)) {
    const command = compileTest(statement, sourceMap);
    sourceMap?.set(command, statement.start);
    return command;
  }

  const command = compileOtherStatement(statement, sourceMap);
  sourceMap?.set(command, statement.start);
  return command;
}

// TODO: ew lol
function compileOtherStatement(statement: parse.Statement, sourceMap: SourceMap | null): commands.Command {
  const [instructionToken, ...operandTokens] = statement.tokens;

  const operands = operandTokens.map((token) => compileOperand(token, sourceMap));

  switch (instructionToken.symbol) {
    case commands.Instructions.echo:
      return compileEcho(operands);

    case commands.Instructions.go:
      return compileGo(operands);

    case commands.Instructions.move:
      return compileMove(operands);

    case commands.Instructions.setCursor:
      return compileCursor(operands);

    default:
      throw new Error(`i'm dumb and can't compile a ${instructionToken.symbol}`);
  }
}

export function compileEcho(operands: commands.Term[]): commands.EchoCommand {
  return {
    instruction: commands.Instructions.echo,
    operands
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

export function compileTest(statement: parse.TestStatement, sourceMap: SourceMap | null): commands.TestCommand {
  const [_instruction, op1, op2, op3, op4] = statement.tokens;

  if (parse.isComparisonToken(op2)) {
    const leftOperand = compileOperand(op1, sourceMap);
    const comparison = compileComparisonTerm(op2, sourceMap);
    const rightOperand = compileOperand(op3!, sourceMap);
    const output = parse.isRefToken(op4)
      ? compileRefTerm(op4, sourceMap)
      : DEFAULT_TEST_OUTPUT;

    return {
      instruction:  commands.Instructions.test,
      leftOperand,
      comparison,
      rightOperand,
      output
    };
  }

  const output = parse.isRefToken(op2)
    ? compileRefTerm(op2, sourceMap)
    : DEFAULT_TEST_OUTPUT;

  return {
    instruction: commands.Instructions.test,
    leftOperand: compileOperand(op1, sourceMap),
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
  const sourceMap: SourceMap = new Map();

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
