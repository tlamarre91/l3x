import * as commands from "../commands";
import * as parse from "../parse";
import { SourceMap } from "..";
import { compileOperands } from "./terms";

// TODO: do validation in parse, like with parse.TestStatement and parse.WriteStatement
export function compileMove(statement: parse.MoveStatement, sourceMap: SourceMap): commands.MoveCommand {
  const operands = compileOperands(statement.tokens.slice(1), sourceMap);
  if (operands.length !== 1) {
    throw new Error(`${commands.Instructions.move} takes 1 operand`);
  }

  const command = {
    instruction: commands.Instructions.move,
    edgeKey: operands[0],
  };
  sourceMap.set(command, statement.start);
  return command;;
}
