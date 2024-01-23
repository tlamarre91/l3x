import * as commands from "@/model/agent/commands";
import { Instructions } from "@/model/agent/commands";
import * as parse from "./parse";
import { AgentStateMachine } from "./AgentStateMachine";

export function compileStatement(statement: parse.Statement): commands.AgentCommand {
  const [instruction, ...operands] = statement.tokens;

  if (!commands.isInstruction(instruction.symbol)) {
    throw new Error(`unrecognized instruction: ${instruction.symbol}`);
  }

  switch (instruction.symbol) {
    case Instructions.echo:
      return compileEcho(operands);

    case Instructions.go:
      return compileGo(operands);

    case Instructions.move:
      return compileMove(operands);

    case Instructions.test:
      return compileTest(operands);

    default:
      throw new Error(`i'm dumb and can't compile a ${instruction.symbol} or anything really`);
  }
}

export function compileEcho(operands: parse.Token[]): commands.AgentEchoCommand {
  return {
    instruction: "echo",
    message: operands.map((token) => token.symbol).join(" ")
  };
}

export function compileGo(operands: parse.Token[]): commands.AgentGoCommand {
  if (operands.length !== 1) {
    throw new Error(`${Instructions.go} takes 1 operand`);
  }

  return {
    instruction: "go",
    state: operands[0].symbol
  };
}

export function compileMove(operands: parse.Token[]): commands.AgentMoveCommand {
  if (operands.length !== 1) {
    throw new Error(`${Instructions.move} takes 1 operand`);
  }

  return {
    instruction: "move",
    edgeName: operands[0].symbol,
  };
}

export function compileTest(operands: parse.Token[]): commands.AgentTestCommand {
  if (operands.length !== 3) {
    throw new Error(`${Instructions.test} takes 3 operands`);
  }

  return {
    instruction: "test",
    leftOperand: operands[0].symbol,
    comparison: operands[1].symbol,
    rightOperand: operands[2].symbol
  };
}

export function compile(program: parse.Program): AgentStateMachine {
  const procedures = new Map<string, commands.Procedure>();
  const sourceMap = new Map<commands.AgentCommand | commands.Procedure, parse.LineAndColumn>();

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

export default compile;
