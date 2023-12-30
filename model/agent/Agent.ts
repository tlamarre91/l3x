import { Observable, Subject } from "rxjs";
import { NetworkClient } from "@/model/network/NetworkClient";
import * as events from "./events";
import * as commands from "./commands";
import * as programs from "./programs";

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
  readonly #eventSubject: Subject<events.SequentialAgentEvent>;
  readonly events$: Observable<events.SequentialAgentEvent>;
  readonly #executionState: programs.ExecutionState;
  readonly observableExecutionState: programs.ExecutionStateObservable;
  #stateMachine: programs.AgentStateMachine;

  #nextEventId: number = 0;

  constructor(name?: string, stateMachine?: programs.AgentStateMachine) {
    this.id = newAgentId();

    if (name == null) {
      name = `agent-${Math.floor(Math.random() * 1000000)}`;
    }
    this.name = name;

    this.#eventSubject = new Subject();
    this.events$ = this.#eventSubject.asObservable();

    this.#stateMachine = stateMachine ?? programs.emptyStateMachine();
    this.#executionState = new programs.ExecutionState();
    this.observableExecutionState = this.#executionState.asObservables();
  }

  static fromCode(name: string, code: string) {
    const program = programs.parse(code);
    const stateMachine = programs.compile(program);
    return new Agent(name, stateMachine);
  }

  #emit(event: events.AgentEvent) {
    const seqEvent = { id: this.#nextEventId++, ...event } satisfies events.SequentialAgentEvent;
    this.#eventSubject.next(seqEvent);
  }

  die() {
    this.#executionState.alive$.next(false);
    // TODO: emit death knell
  }

  reprogram(code: string) {
    const program = programs.parse(code);
    const stateMachine = programs.compile(program);
    this.#stateMachine = stateMachine;
    this.#executionState.initialize();
    console.log("reprogrammed", this);
  }

  setState(state: string) {
    if (!this.#stateMachine.procedures.has(state)) {
      throw new Error(`state machine doesn't have state ${state}`);
    }

    this.#executionState.stateName$.next(state);
  }

  #getSelectedCommand(): commands.AgentCommand {
    const commandIndex = this.#executionState.commandIndex$.getValue();
    console.log({ commandIndex });
    const stateName = this.#executionState.stateName$.getValue();
    // console.log(this.#stateMachine.procedures);
    const procedure = this.#stateMachine.procedures.get(stateName);

    if (procedure == null) {
      throw new Error(`ain't no procedure for state ${stateName}`);
    }

    const command = procedure.commands[commandIndex];
    return command;
  }

  process() {
    if (!this.#executionState.alive$.getValue()) {
      console.log(`can't process; agent ${this.name} is dead`);
      return;
    }
    const command = this.#getSelectedCommand();

    const result = this.executeCommand(command);

    if (result.status !== "ok") {
      this.#emit({ type: "error", errorName: result.errorName, errorMessage: result.errorMessage });
      this.die();
    }

    const index$ = this.#executionState.commandIndex$;
    if (result.setCommandIndex != null) {
      index$.next(result.setCommandIndex);
    } else {
      index$.next(index$.getValue() + 1);
    }

    if (result.eventsToEmit != null) {
      for (const event of result.eventsToEmit) {
        this.#emit(event);
      }
    }

    // TODO: handle increment command index
  }

  executeCommand(command: commands.AgentCommand): commands.CommandResult {
    try {
      const result = this.#executeCommandUnsafe(command);
      return result;
    } catch (error) {
      return commands.resultFromError(error);
    }
  }

  #executeCommandUnsafe(command: commands.AgentCommand): commands.CommandResult {
    if (commands.isEcho(command)) {
      return this.#executeEcho(command);
    }

    if (commands.isGo(command)) {
      return this.#executeGo(command);
    }

    if (commands.isMove(command)) {
      return this.#executeMove(command);
    }

    throw new Error(`${command.instruction} not implemented`);
  }

  #executeEcho({ message }: commands.AgentEchoCommand): commands.CommandResult {
    const eventsToEmit = [{ type: "echo", message } as const];
    return { status: "ok", eventsToEmit };
  }

  #executeGo({ state }: commands.AgentGoCommand): commands.CommandResult {
    this.setState(state);

    return {
      status: "ok",
      setCommandIndex: 0
    };
  }

  #executeMove({ edgeName }: commands.AgentMoveCommand): commands.CommandResult {
    if (this.networkClient == null) {
      throw new Error("can't ask to move when i don't have a network client");
    }

    const req = { type: "move", edgeName } as const; 
    const { status, message } = this.networkClient.request(req);

    if (status !== "ok") {
      throw new Error(`got a bad response from the network: ${message}`);
    }

    return { status };
  }

  // executeWrite(command: AgentWriteCommand) {
  //   throw new Error("not implemented");
  // }
  //
  // executeMove(
}
