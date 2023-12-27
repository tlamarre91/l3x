import { IStateful } from "../IStateful";
import { StateMachine } from "../StateMachine";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { NetworkClient } from "@/model/network/NetworkClient";
import * as events from "./events";
import * as commands from "./commands";

// export interface AgentState {
//   onExit?: (agent: Agent) => void;
//   onCommandStart?: (agent: Agent, command: AgentCommand) => void;
//   onCommandEnd?: (agent: Agent, command: AgentCommand) => void;
//   onEnter?: (agent: Agent) => void;
//   // onOutput?: (output: AgentCommandOutput) => void;
// }
//
// type AgentStateMachine = StateMachine<string, AgentState>;

export interface AgentState {
  name: string;
  commands: commands.AgentCommand[];
  commandIndex: number;
}

const newAgentId = (() => {
  let agentId = 0;

  function _newAgentId() {
    return agentId++;
  }

  return _newAgentId;
})();

export class Agent {
  type = "agent" as const;
  id: number;
  name: string;
  networkClient: NetworkClient<Agent> | null = null;
  readonly #eventSubject: Subject<events.AgentEvent>;
  readonly events$: Observable<events.AgentEvent>;
  readonly stateSubject: BehaviorSubject<AgentState | null>;
  readonly state$: Observable<AgentState | null>;
  #states: Map<string, AgentState>;
  #commandQueue: commands.AgentCommand[];
  #stack: string[];
  #indexInStack: BehaviorSubject<number>;

  constructor(name?: string) {
    this.id = newAgentId();
    if (name == null) {
      name = `agent-${Math.floor(Math.random() * 1000000)}`;
    }

    this.name = name;
    this.#eventSubject = new Subject();
    this.events$ = this.#eventSubject.asObservable();
    this.#states = new Map();
    this.stateSubject = new BehaviorSubject<AgentState | null>(null);
    this.state$ = this.stateSubject.asObservable();
    this.#commandQueue = [];
    this.#stack = [];
    this.#indexInStack = new BehaviorSubject(0);
  }

  setState(key: string) {
    this.currentState?.onExit?.(this);
    const newState = this.#states.setState(key);
    newState.onEnter?.(this);
    return newState;
  }

  addState(key: string, callbacks: AgentState) {
    return this.#states.addState(key, callbacks);
  }

  get currentStateKey() {
    return this.#states.currentStateKey;
  }

  get currentState() {
    return this.#states.currentState;
  }

  queueCommand(command: commands.AgentCommand) {
    this.#commandQueue.push(command);
  }

  peekCommand(): commands.AgentCommand | undefined {
    return this.#commandQueue[0];
  }

  dequeueCommand(): commands.AgentCommand | undefined{
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

    this.#eventSubject.next(output);
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

  executeCommand(command: commands.AgentCommand): events.AgentEvent | void {
    try {
      const eventToEmit = this.executeCommandUnsafe(command);
      if (eventToEmit == null) {
        return;
      }

      this.#eventSubject.next(eventToEmit);
    } catch (err) {
      return { type: "error", error: String(err) };
    }

  }

  executeCommandUnsafe(command: commands.AgentCommand): events.AgentEvent | void {
    if (commands.isEcho(command)) {
      return this.executeEcho(command);
    }

    throw new Error("not implemented");
  }

  executeEcho({ message }: commands.AgentEchoCommand): events.AgentEchoEvent {

    return { type: "echo", message };
  }

  executeSetState(command: commands.AgentSetStateCommand): events.AgentSetStateEvent {
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
