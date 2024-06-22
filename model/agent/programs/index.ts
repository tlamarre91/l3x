/**
 * Parse and compile l3x programs 😈
 */

import { Command, Procedure, Term } from "./commands";
import { compile } from "./compile";
import { parse, LineAndColumn } from "./parse";

export {
  type AgentStateMachine,
  ExecutionState,
  type ExecutionStateObservables,
  emptyStateMachine,
} from "./AgentStateMachine";

/** Parse and compile a l3x program from a string */
export function parseAndCompile(code: string): ReturnType<typeof compile> {
  return compile(parse(code));
}

/**
 * Keeps track of where parts of an agent's behavior are defined in a program
 *
 * TODO: should this be an object that exposes a Map interface, and also
 * keeps track of the original program?
 */
export type SourceMap = Map<Command | Procedure | Term, LineAndColumn>;

export {
  parse,
  compile
};
