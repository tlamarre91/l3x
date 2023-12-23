import { IStateful } from "../IStateful";
import { StateMachine } from "../StateMachine";
import { Subject } from "rxjs";
import { AgentEvent, AgentEchoEvent, AgentSetStateEvent } from "./events";
import { AgentCommand, AgentEchoCommand, AgentSetStateCommand } from "./commands";
import { AgentNetworkInterface } from "../network/AgentNetworkInterface";

export interface AgentState {
  onExit?: (agent: Agent) => void;
  onCommandStart?: (agent: Agent, command: AgentCommand) => void;
  onCommandEnd?: (agent: Agent, command: AgentCommand) => void;
  onEnter?: (agent: Agent) => void;
  // onOutput?: (output: AgentCommandOutput) => void;
}

type AgentStateMachine = StateMachine<string, AgentState>;

export class Agent implements IStateful<string, AgentState> {
  name: string;
  networkInterface: AgentNetworkInterface | null = null;
  // TODO: make private, expose public observables
  readonly eventSubject: Subject<AgentEvent>;
  #stateMachine: AgentStateMachine;
  #commandQueue: AgentCommand[];
  #stack: string[];
  // #registers?: string[];

  constructor(name?: string) {
    if (name == null) {
      name = `agent-${Math.floor(Math.random() * 1000000)}`;
    }

    this.name = name;
    this.eventSubject = new Subject();
    this.#stateMachine = new StateMachine<string, AgentState>();
    this.#commandQueue = [];
    this.#stack = [];
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

    this.eventSubject.next(output);
  }

  pushStack(value: string): void {
    this.#stack.push(value);
  }

  popStack(): string | undefined {
    return this.#stack.pop();
  }

  peekStack(): string | undefined {
    return this.#stack.at(-1);
  }

  // getRegister(index: number): string {
  //   if (this.#registers == null) {
  //     throw new Error("got no registers");
  //   }
  //
  //   return this.#registers[index];
  // }
  //
  // setRegister(index: number, value: string): void {
  //   if (this.#registers == null) {
  //     this.#registers = [];
  //   }
  //
  //   this.#registers[index] = value;
  // }

  executeCommand(command: AgentCommand): AgentEvent | void {
    try {
      const eventToEmit = this.executeCommandUnsafe(command);
      if (eventToEmit == null) {
        return;
      }

      this.eventSubject.next(eventToEmit);
    } catch (err) {
      return { type: "error", agent: this, error: String(err) };
    }

  }

  executeCommandUnsafe(command: AgentCommand): AgentEvent | void {
    if (command.isEcho()) {
      return this.executeEcho(command);
    }

    if (command.isSetState()) {
      return this.executeSetState(command);
    }

    if (command.isWrite()) {
      throw new Error("not implemented");
      // return this.executeWrite(command);
    }
  }

  executeEcho(command: AgentEchoCommand): AgentEchoEvent {
    const message = (() => {
      return `${command.left}: ${this.peekStack()}`;
    })();

    return { type: "echo", agent: this, message };
  }

  executeSetState(command: AgentSetStateCommand): AgentSetStateEvent {
    console.log(command);
    throw new Error("not implemented");
    // const fromStateKey = this.currentStateKey;
    // this.setState(command.left);
    // return { type: "setstate", agent: this, fromStateKey, toStateKey: command.left };;
  }

  // executeWrite(command: AgentWriteCommand) {
  //   throw new Error("not implemented");
  // }
  //
  // executeMove(
}
