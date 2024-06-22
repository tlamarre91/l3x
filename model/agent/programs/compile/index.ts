/**
 * Compile l3x programs!
 */

import * as commands from "../commands";
import * as parse from "../parse";
import { AgentStateMachine } from "../AgentStateMachine";
import { SourceMap } from "..";
import { compileTest } from "./compileTest";
import { compileWrite } from "./compileWrite";
import { compileMove } from "./compileMove";
import { compileGo } from "./compileGo";
import { compileEcho } from "./compileEcho";
import { compileSetCursor } from "./compileSetCursor";
import { compileDef } from "./compileDef";
import { compileGoIfTrue } from "./compileGoIfTrue";
import { compileGoIfFalse } from "./compileGoIfFalse";

export function compileCommand(statement: parse.Statement, sourceMap: SourceMap): commands.Command {
  const instructionToken = statement.tokens[0];
  if (!commands.isInstruction(instructionToken.symbol)) {
    throw new Error(`unrecognized instruction: ${instructionToken.symbol}`);
  }

  if (parse.isTestStatement(statement)) {
    return compileTest(statement, sourceMap);
  }

  if (parse.isWriteStatement(statement)) {
    return compileWrite(statement, sourceMap);
  }

  if (parse.isEchoStatement(statement)) {
    return compileEcho(statement, sourceMap);
  }

  if (parse.isGoStatement(statement)) {
    return compileGo(statement, sourceMap);
  }

  if (parse.isGoIfTrueStatement(statement)) {
    return compileGoIfTrue(statement, sourceMap);
  }

  if (parse.isGoIfFalseStatement(statement)) {
    return compileGoIfFalse(statement, sourceMap);
  }

  if (parse.isMoveStatement(statement)) {
    return compileMove(statement, sourceMap);
  }

  if (parse.isSetCursorStatement(statement)) {
    return compileSetCursor(statement, sourceMap);
  }

  throw new Error(`i'm dumb and can't compile a ${instructionToken.symbol}`);
}

/** Take a program and turn it into a set of behaviors for an `Agent` */
export function compile(program: parse.Program): AgentStateMachine {
  const procedures = new Map<string, commands.Procedure>();
  const sourceMap: SourceMap = new Map();

  let currentStateName: string | undefined = undefined;
  let currentProcedure: commands.Procedure | undefined = undefined;

  for (const statement of program.statements) {
    if (statement.tokens[0].symbol === parse.Keywords.def) {

      currentProcedure = compileDef(statement, sourceMap);
      if (procedures.has(currentProcedure.name)) {
        throw new Error(`multiple definitions for state ${currentStateName}`);
      }

      procedures.set(currentProcedure.name, currentProcedure);

      continue;
    }

    if (currentProcedure == null) {
      throw new Error("statement is not part of a state definition");
    }

    const command = compileCommand(statement, sourceMap);
    currentProcedure.commands.push(command);
  }

  return {
    program,
    procedures,
    sourceMap
  };
}

export default compile;
