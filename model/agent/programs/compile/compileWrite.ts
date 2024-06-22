import * as commands from "../commands";
import * as parse from "../parse";
import { SourceMap } from "..";
import { compileOperand, compileRefTerm } from "./terms";
import { DEFAULT_OUTPUT_REGISTER } from "../constants";

export function compileWrite(statement: parse.WriteStatement, sourceMap: SourceMap): commands.WriteCommand {
  const [_instruction, dataToken, outputToken] = statement.tokens;

  const data = compileOperand(dataToken, sourceMap);
  const output = outputToken != null
    ? compileRefTerm(outputToken, sourceMap)
    : DEFAULT_OUTPUT_REGISTER;

  const command = {
    instruction: "write",
    data,
    output
  } as const;
  sourceMap.set(command, statement.start);
  return command;
}
