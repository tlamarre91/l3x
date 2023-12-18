// export type AgentInstruction = "echo" | "move" | "read" | "write" | "state";
export type AgentInstruction =
  | "echo"    // Send a message
  | "move"    // Cross a link
  | "pwrite"  // Peek stack and write value to cell
  | "write"   // Pop stack and write to cell
  | "state";

export class AgentCommand<LeftOperandType = unknown, RightOperandType = unknown> {
  instruction: AgentInstruction;
  left?: LeftOperandType;
  right?: RightOperandType;

  constructor(instruction: AgentInstruction, leftOperand?: LeftOperandType, rightOperand?: RightOperandType) {
    this.instruction = instruction;
    this.left = leftOperand;
    this.right = rightOperand;
  }

  isEcho(): this is AgentEchoCommand {
    return this.instruction === "echo";
  }

  isSetState(): this is AgentSetStateCommand {
    return this.instruction === "state";
  }

  isWrite(): this is AgentWriteCommand {
    return this.instruction === "pwrite";
  }
}

export interface AgentEchoCommand extends AgentCommand<string | undefined, undefined> {
  instruction: "echo";
}

export interface AgentMoveCommand extends AgentCommand<string | undefined, undefined> {
  instruction: "move";
}

export interface AgentUnaryCommand<OperandType> extends AgentCommand<OperandType, void> {
  left: OperandType
}

export interface AgentSetStateCommand extends AgentUnaryCommand<string> {
  instruction: "state";
}

export interface AgentBinaryCommand<LeftOperandType, RightOperandType> extends AgentCommand<LeftOperandType, RightOperandType> {
  left: LeftOperandType;
  right: RightOperandType;
}


export interface AgentWriteCommand extends AgentBinaryCommand<string, number> {
  instruction: "write"
}
