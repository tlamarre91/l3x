import { IStateful } from "./IStateful";
import { StateMachine } from "./StateMachine";

export interface AgentState {
  onExit?: (agent: Agent) => void;
  onCommandStart?: (agent: Agent, command: AgentCommand) => void;
  onCommandEnd?: (agent: Agent, command: AgentCommand) => void;
  onEnter?: (agent: Agent) => void;
  onOutput?: (output: AgentCommandOutput) => void;
}

type AgentStateMachine = StateMachine<string, AgentState>;

export class Agent implements IStateful<string, AgentState> {
  name: string;
  #registers?: string[];
  #stateMachine: AgentStateMachine;
  #commandQueue: AgentCommand[];

  constructor(name?: string) {
    if (name == null) {
      name = `agent-${Math.floor(Math.random() * 1000000)}`;
    }

    this.name = name;
    this.#stateMachine = new StateMachine<string, AgentState>();
    this.#commandQueue = [];
  }

  setState(key: string) {
    this.currentState?.onExit?.(this);
    const newState = this.#stateMachine.setState(key);
    newState.onEnter?.(this);
    return newState;
  }

  addState(key: string, callbacks: AgentState) {
    return this.#stateMachine.addState(key, callbacks);
  }

  get currentStateKey() {
    return this.#stateMachine.currentStateKey;
  }

  get currentState() {
    return this.#stateMachine.currentState;
  }

  queueCommand(command: AgentCommand) {
    this.#commandQueue.push(command);
  }

  peekCommand(): AgentCommand | undefined {
    return this.#commandQueue[0];
  }

  dequeueCommand(): AgentCommand | undefined{
    return this.#commandQueue.shift();
  }

  process() {
    const command = this.dequeueCommand();

    if (command == null) {
      console.log(`${this.name} processed empty queue`);
      return;
    }

    const output = this.executeCommand(command);

    if (output == null) {
      return;
    }

    this.currentState?.onOutput?.(output);
  }

  getRegister(index: number): string {
    if (this.#registers == null) {
      throw new Error("got no registers");
    }

    return this.#registers[index];
  }

  setRegister(index: number, value: string): void {
    if (this.#registers == null) {
      this.#registers = [];
    }

    this.#registers[index] = value;
  }

  executeCommand(command: AgentCommand): AgentCommandOutput | void {
    try {
      return this.executeCommandUnsafe(command);
    } catch (err) {
      return { agent: this, error: String(err) };
    }

  }

  executeCommandUnsafe(command: AgentCommand): AgentCommandOutput | void {
    if (command.isEcho()) {
      return this.executeEcho(command);
    }

    if (command.isSetState()) {
      return this.executeSetState(command);
    }

    if (command.isWrite()) {
      return this.executeWrite(command);
    }
  }

  executeEcho(command: AgentEchoCommand) {
    const message = (() => {
      if (command.right == null) {
        return command.left ?? "<empty>";
      }

      return `${command.left}: ${this.getRegister(command.right)}`;
    })();

    const output = { agent: this, message };
    return output;
  }

  executeSetState(command: AgentSetStateCommand) {
    this.setState(command.left);
    return;
  }

  executeWrite(command: AgentWriteCommand) {
    this.setRegister(command.right, command.left);
    return;
  }
}

// export type AgentInstruction = "echo" | "move" | "read" | "write" | "state";
export type AgentInstruction = "echo" | "move" | "write" | "state";

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
    return this.instruction === "write";
  }
}

export interface AgentEchoCommand extends AgentCommand<string | undefined, number | undefined> {
  instruction: "echo";
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

export interface AgentCommandOutput {
  agent: Agent;
  error?: string;
  message?: string;
}
