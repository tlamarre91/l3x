import { Command, Procedure, Term } from "./commands";
import { compile } from "./compile";
import { parse, LineAndColumn } from "./parse";

export {
  type AgentStateMachine,
  ExecutionState,
  type ExecutionStateObservables,
  emptyStateMachine,
} from "./AgentStateMachine";

export function parseAndCompile(code: string): ReturnType<typeof compile> {
  return compile(parse(code));
}

export type SourceMap = Map<Command | Procedure | Term, LineAndColumn>;

export {
  parse,
  compile
};
