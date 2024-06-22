import * as commands from "../commands";
import * as parse from "../parse";
import { SourceMap } from "..";
import { compileOperands } from "./terms";

// TODO: do validation in parse, like with parse.TestStatement and parse.WriteStatement
export function compileGoIfFalse(statement: parse.GoStatement, sourceMap: SourceMap): commands.GoCommand {
//   const operands = compileOperands(statement.tokens.slice(1), sourceMap);
//   if (operands.length !== 1) {
//     throw new Error(`${commands.Instructions.go} takes 1 operand`);
//   }

//   const command = {
//     instruction: commands.Instructions.go,
//     state: operands[0]
//   };
//   sourceMap.set(command, statement.start);
//   return command;;
}


