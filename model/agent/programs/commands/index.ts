import { Status, type StatusValue } from "@/utils";
import { AgentEvent } from "../../events";
import { NamedRegister } from "../../programs/DataDeque";

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
  write: "write"
} as const;

export type Instruction = typeof Instructions[keyof typeof Instructions];

export function isInstruction(s: string | undefined): s is Instruction {
  const isInstruction = Object.values(Instructions).includes(s as Instruction);
  return isInstruction;
}

export type TermType = "literal" | "ref" | "comparison";

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

export interface Term {
  readonly type: TermType;
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

export interface Command {
  instruction: Instruction;
  output?: RefTerm | undefined;
  edgeKey?: Term;
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

export interface GoIfTrueCommand extends Command {
  instruction: typeof Instructions.goIfTrue;
  state: Term;
}

export function isGoIfTrue(command: Command): command is GoIfTrueCommand {
  return command.instruction === Instructions.go;
}

export interface GoIfFalseCommand extends Command {
  instruction: typeof Instructions.goIfFalse;
  state: Term;
}

export function isGoIfFalse(command: Command): command is GoCommand {
  return command.instruction === Instructions.goIfFalse;
}

export interface MoveCommand extends Command {
  instruction: typeof Instructions.move;
  edgeKey: Term;
}

export function isMove(command: Command): command is MoveCommand {
  return command.instruction === Instructions.move;
}

export interface AgentLinksCommand extends Command {
  instruction: typeof Instructions.links;
  edgeKey: Term;
}

export function isLinks(command: Command): command is AgentLinksCommand {
  return command.instruction === Instructions.links;
}

export interface TestCommand extends Command {
  instruction: typeof Instructions.test;
  leftOperand: Term;
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

export interface WriteCommand extends Command {
  instruction: typeof Instructions.write;
  data: Term;
  output: RefTerm;
}

export function isWrite(command: Command): command is WriteCommand {
  return command.instruction === Instructions.write;
}

export interface CommandResult {
  status: StatusValue;
  eventsToEmit?: AgentEvent[];
  setCommandIndex?: number;
  incrementCommandIndex?: number;
}

export interface SuccessResult extends CommandResult {
  status: typeof Status.ok;
}

export function isSuccessResponse(result: CommandResult): result is SuccessResult {
  return result.status === Status.ok;
}

export interface ErrorResult extends CommandResult {
  status: typeof Status.fu;
  errorName: string;
  errorMessage: string;
}

export function isErrorResult(result: CommandResult): result is ErrorResult {
  return result.status === Status.fu;
}

export function resultFromError(error: unknown): ErrorResult {
  const status = Status.fu;

  if (error instanceof Error) {
    return { status, errorName: error.name, errorMessage: error.message };
  }

  console.warn("Creating ErrorResult from non-Error object", error);

  return { status, errorName: "Unexpected error", errorMessage: String(error) };
}

export const OK_RESULT: CommandResult = { status: Status.ok };
