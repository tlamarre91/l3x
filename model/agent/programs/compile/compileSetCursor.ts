import * as commands from "../commands";
import * as parse from "../parse";
import { SourceMap } from "..";
import { compileOperands } from "./terms";

// TODO: do validation in parse, like with parse.TestStatement and parse.WriteStatement
export function compileSetCursor(statement: parse.Statement, sourceMap: SourceMap): commands.SetCursorCommand {
  const operands = compileOperands(statement.tokens.slice(1), sourceMap);
  if (operands.length !== 1) {
    throw new Error(`SetCursorCommand takes 1 argument, got ${operands.length}`);
  }

  const op = operands[0];
  if (op.type !== "literal") {
    throw new Error(`SetCursorCommand takes 1 literal argument, got argument of type ${op.type}`);
  }

  const command = {
    instruction: commands.Instructions.setCursor,
    offset: parseInt(op.value!),
    relative: true
  };
  sourceMap.set(command, statement.start);
  return command;
}
