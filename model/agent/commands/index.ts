import { Status } from "@/utils";
import { AgentEvent } from "../events";
import { NamedRegister } from "../programs/AgentStateMachine";

export const Instructions = {
  echo: "echo",
  move: "move",
  links: "links",
  go: "go",
  test: "test",
  setCursor: "curs",
  create: "create",
  clone: "clone",
  goIfTrue: "tgo",
  goIfFalse: "fgo",
  stun: "stun",
} as const;

export type Instruction = typeof Instructions[keyof typeof Instructions];

export function isInstruction(s: string | undefined): s is Instruction {
  const isInstruction = Object.values(Instructions).includes(s as Instruction);
  return isInstruction;
}

export interface Term {
  readonly type: "literal" | "ref" | "comparison";
  readonly value?: string;
  readonly register?: NamedRegister;
  readonly comparison?: Comparison;
}

export interface ComparisonTerm extends Term {
  readonly type: "comparison";
  readonly comparison: Comparison;
}

export interface LiteralTerm extends Term {
  readonly type: "literal";
  readonly value: string;
}

export interface RefTerm extends Term {
  readonly type: "ref";
  readonly register: NamedRegister;
}

export type Comparison =
  | "<"
  | "<="
  | "="
  | ">"
  | ">="
  | "!=";

export function isComparison(s: string | undefined): s is Comparison {
  return [
    "<",
    "<=",
    "=",
    ">",
    ">=",
    "!=",
  ].includes(s as Comparison);
}

export interface Command {
  instruction: Instruction;
  output?: RefTerm | undefined;
  edgeName?: Term;
  nodeName?: Term;
  operands?: Term[];
  state?: Term;
  leftOperand?: Term;
  rightOperand?: Term;
  comparison?: ComparisonTerm;
}

export interface Procedure {
  name: string;
  commands: Command[];
}

export interface EchoCommand extends Command {
  instruction: typeof Instructions.echo;
  operands: Term[];
}

export function isEcho(command: Command): command is EchoCommand {
  return command.instruction === Instructions.echo;
}

export interface GoCommand extends Command {
  instruction: typeof Instructions.go;
  state: Term;
}

export function isGo(command: Command): command is GoCommand {
  return command.instruction === Instructions.go;
}

export interface MoveCommand extends Command {
  instruction: typeof Instructions.move;
  edgeName: Term;
}

export function isMove(command: Command): command is MoveCommand {
  return command.instruction === Instructions.move;
}

export interface AgentLinksCommand extends Command {
  instruction: typeof Instructions.links;
  edgeName: Term;
}

export function isLinks(command: Command): command is AgentLinksCommand {
  return command.instruction === Instructions.links;
}

export interface TestCommand extends Command {
  instruction: typeof Instructions.test;
  leftOperand?: Term;
  rightOperand?: Term;
  comparison?: ComparisonTerm;
  output: RefTerm;
}

export function isTest(command: Command): command is TestCommand {
  return command.instruction === Instructions.test;
}

export interface SetCursorCommand extends Command {
  instruction: typeof Instructions.setCursor;
  offset: number;
  relative: boolean;
}

export function isSetCursor(command: Command): command is SetCursorCommand {
  return command.instruction === Instructions.test;
}

export interface CommandResult {
  status: Status;
  errorName?: string;
  errorMessage?: string;
  eventsToEmit?: AgentEvent[];
  setCommandIndex?: number;
  incrementCommandIndex?: number;
}

export interface ErrorResult extends CommandResult {
  status: "fu";
  errorName: string;
  errorMessage: string;
}

export function resultFromError(error: unknown): ErrorResult {
  const status = "fu";

  if (error instanceof Error) {
    return { status, errorName: error.name, errorMessage: error.message };
  }

  console.warn("Creating ErrorResult from non-Error object", error);

  return { status, errorName: "Unexpected error", errorMessage: String(error) };
}
