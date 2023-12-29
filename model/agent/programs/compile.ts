import * as commands from "@/model/agent/commands";
import { Instructions } from "@/model/agent/commands";
import * as parse from "./parse";
import { AgentStateMachine } from "./AgentStateMachine";

export function compileStatement(statement: parse.Statement): commands.AgentCommand {
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

    command.state = operands[0].symbol;
    break;

  case Instructions.move:
    if (operands.length !== 1) {
      throw new Error(`${Instructions.move} takes 1 operand`);
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

export function compile(program: parse.Program): AgentStateMachine {
  const procedures = new Map<string, commands.Procedure>();
  const sourceMap = new Map<commands.AgentCommand | commands.Procedure, parse.LineAndColumn>();

  let currentStateName: string | undefined = undefined;
  // let currentlyCompilingStateCommands: commands.AgentCommand[] | undefined = undefined;
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
