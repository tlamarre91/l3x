import * as commands from "../commands";
import * as parse from "../parse";
import { SourceMap } from "..";
import { compileOperands } from "./terms";

// TODO: do validation in parse, like with parse.TestStatement and parse.WriteStatement
export function compileEcho(statement: parse.EchoStatement, sourceMap: SourceMap): commands.EchoCommand {
  const operands = compileOperands(statement.tokens.slice(1), sourceMap);
  const command = {
    instruction: commands.Instructions.echo,
    operands
  };
  sourceMap.set(command, statement.start);
  return command;;
}
