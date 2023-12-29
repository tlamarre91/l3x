export const Instructions = {
  echo: "echo",
  move: "move",
  links: "links",
  go: "go",
  test: "test",
  tgo: "tgo",
  fgo: "fgo"
} as const;

export type Instruction = typeof Instructions[keyof typeof Instructions];

export function isInstruction(s: string): s is Instruction {
  // TODO: eehhhh
  const isinst = Object.hasOwn(Instructions, s);
  return isinst;
}

export interface AgentCommand {
  instruction: Instruction;
  output?: "prepend" | "append" | "insert" | "ignore";
  edgeName?: string;
  nodeName?: string;
  message?: string;
  leftOperand?: string;
  rightOperand?: string;
  comparison?: string;
}

export interface Procedure {
  name: string;
  commands: AgentCommand[];
}

export interface AgentEchoCommand extends AgentCommand {
  instruction: typeof Instructions.echo;
  message: string;
}

export function isEcho(command: AgentCommand): command is AgentEchoCommand {
  return command.instruction === Instructions.echo;
}

export interface AgentMoveCommand extends AgentCommand {
  instruction: typeof Instructions.move;
  edgeName: string;
}

export function isMove(command: AgentCommand): command is AgentMoveCommand {
  return command.instruction === Instructions.move;
}

export interface AgentLinksCommand extends AgentCommand {
  instruction: typeof Instructions.links;
  edgeName: string;
}

export function isLinks(command: AgentCommand): command is AgentLinksCommand {
  return command.instruction === Instructions.links;
}

export interface AgentTestCommand extends AgentCommand {
  instruction: typeof Instructions.test;
  leftOperand?: string;
  rightOperand?: string;
  comparison?: string;
}

export function isTest(command: AgentCommand): command is AgentTestCommand {
  return command.instruction === Instructions.test;
}
