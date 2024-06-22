import * as commands from "../commands";
import * as parse from "../parse";
import { SourceMap } from "..";
import { compileOperand, compileComparisonTerm, compileRefTerm } from "./terms";
import { DEFAULT_OUTPUT_REGISTER } from "../constants";

export function compileTest(statement: parse.TestStatement, sourceMap: SourceMap): commands.TestCommand {
  const [_instruction, op1, op2, op3, op4] = statement.tokens;

  if (parse.isComparisonToken(op2)) {
    const leftOperand = compileOperand(op1, sourceMap);
    const comparison = compileComparisonTerm(op2, sourceMap);
    const rightOperand = compileOperand(op3!, sourceMap);
    const output = op4 != null
      ? compileRefTerm(op4, sourceMap)
      : DEFAULT_OUTPUT_REGISTER;

    const command = {
      instruction: commands.Instructions.test,
      leftOperand,
      comparison,
      rightOperand,
      output
    }
    sourceMap.set(command, statement.start);
    return command;;
  }

  const output = parse.isRefToken(op2)
    ? compileRefTerm(op2, sourceMap)
    : DEFAULT_OUTPUT_REGISTER;

  const command = {
    instruction: commands.Instructions.test,
    leftOperand: compileOperand(op1, sourceMap),
    output
  };
  sourceMap.set(command, statement.start);
  return command;;
}

