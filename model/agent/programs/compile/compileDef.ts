import * as commands from "../commands";
import * as parse from "../parse";
import { SourceMap } from "..";

// TODO: do validation in parse, like with parse.TestStatement and parse.WriteStatement
export function compileDef(statement: parse.Statement, sourceMap: SourceMap): commands.Procedure {
  const [_instruction, ...operands] = statement.tokens;

  if (operands.length !== 1) {
    throw new Error("def takes 1 operand");
  }

  const [name] = operands;

  const procedure = {
    name: name.symbol,
    commands: []
  } satisfies commands.Procedure;

  sourceMap.set(procedure, statement.start);

  return procedure;
}
