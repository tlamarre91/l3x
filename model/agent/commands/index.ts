export type AgentInstruction =
  | "echo"    // Send a message
  | "move"    // Request to cross a link
  | "links"   // Request names of edges out of this node
  | "route"   // Request a route to a node
  | "get"     // Request the data stored in the current node
  | "state";  // Switch to a new state

export interface AgentCommand {
  instruction: AgentInstruction;
  output?: "prepend" | "append" | "insert" | "ignore";
  edgeName?: string;
  nodeName?: string;
}

export interface AgentEchoCommand extends AgentCommand {
  instruction: "echo";
  message: string;
}

export function isEcho(command: AgentCommand): command is AgentEchoCommand {
  return command.instruction === "echo";
}

export interface AgentMoveCommand extends AgentCommand {
  instruction: "move";
  edgeName: string;
}

export function isMove(command: AgentCommand): command is AgentMoveCommand {
  return command.instruction === "move";
}

export interface AgentLinksCommand extends AgentCommand {
  instruction: "links";
  edgeName: string;
}

export function isLinks(command: AgentCommand): command is AgentLinksCommand {
  return command.instruction === "links";
}
