import { Observable, Subject } from "rxjs";
import { NetworkClient } from "@/model/network/NetworkClient";
import * as events from "./events";
import * as programs from "./programs";
import * as commands from "./programs/commands";
import { Program } from "./programs/parse";
import { DataDeque, DataDequeObservables } from "./programs/DataDeque";
import { Status } from "@/utils";
import { L3xObject } from "../L3xObject";

const newAgentId = (() => {
  let agentId = 0;

  function _newAgentId() {
    return agentId++;
  }

  return _newAgentId;
})();


export class Agent extends L3xObject {
  id: number;
  networkClient: NetworkClient<Agent> | null = null;
  readonly #eventSubject: Subject<events.SequentialAgentEvent>;
  readonly events$: Observable<events.SequentialAgentEvent>;
  readonly #executionState: programs.ExecutionState;
  readonly executionStateObservables: programs.ExecutionStateObservables;
  readonly #buffer: DataDeque;
  readonly bufferObservables: DataDequeObservables;
  stateMachine: programs.AgentStateMachine;

  #nextEventId: number = 0;

  constructor(
    name?: string,
    stateMachine?: programs.AgentStateMachine,
    initialExecutionState?: programs.ExecutionState,
    initialBuffer?: DataDeque
  ) {
    const id = newAgentId();
    if (name == null) {
      // TODO: better name generation; should have a way of generating explicitagentname-0, explicitagentname-1, -2, -3... 
      name = `agent-${id}`;
    }
    super("agent", name);
    this.id = id;

    this.#eventSubject = new Subject();
    this.events$ = this.#eventSubject.asObservable();

    this.stateMachine = stateMachine ?? programs.emptyStateMachine();
    this.#executionState = initialExecutionState ?? new programs.ExecutionState();
    this.executionStateObservables = this.#executionState.asObservables();

    this.#buffer = initialBuffer ?? new DataDeque(128); // TODO: parametrize size
    this.bufferObservables = this.#buffer.asObservables();
  }

  static fromCode(name: string, code: string): Agent {
    const stateMachine = programs.parseAndCompile(code);
    return new Agent(name, stateMachine);
  }

  static fromProgram(name: string, program: Program): Agent {
    const stateMachine = programs.compile(program);
    return new Agent(name, stateMachine);
  }

  #emit(event: events.AgentEvent) {
    const seqEvent = { id: this.#nextEventId++, ...event } satisfies events.SequentialAgentEvent;
    this.#eventSubject.next(seqEvent);
  }

  die() {
    this.#executionState.alive$.next(false);
  }

  reprogram(code: string) {
    const program = programs.parse(code);
    const stateMachine = programs.compile(program);
    this.stateMachine = stateMachine;
    this.#executionState.initialize();
    console.log("reprogrammed", this.name);
  }

  setState(state: string) {
    if (!this.stateMachine.procedures.has(state)) {
      throw new Error(`state machine doesn't have state ${state}`);
    }

    this.#executionState.stateName$.next(state);
  }

  #getSelectedCommand(): commands.Command {
    const commandIndex = this.executionStateObservables.getCommandIndex();
    const stateName = this.executionStateObservables.getStateName();
    const procedure = this.stateMachine.procedures.get(stateName);

    if (procedure == null) {
      throw new Error(`ain't no procedure for state ${stateName}`);
    }

    const command = procedure.commands[commandIndex];
    return command;
  }

  /** Execute the next command and other stuff that happens every timestep  */
  process() {
    if (!this.executionStateObservables.getAlive()) {
      // console.log(`can't process; agent ${this.name} is dead`);
      return;
    }

    const command = this.#getSelectedCommand();

    const result = this.executeCommand(command);

    if (commands.isErrorResult(result)) {
      const { errorName, errorMessage } = result;
      this.#emit({ type: "error", errorName, errorMessage });
      // this.die();
      // TODO: should we continue or return?
    }

    if (result.eventsToEmit != null) {
      result.eventsToEmit.forEach((ev) => {
        this.#emit(ev);
      });
    }

    if (result.setCommandIndex != null) {
      this.#executionState.commandIndex$.next(result.setCommandIndex);
    } else {
      const index$ = this.#executionState.commandIndex$;
      index$.next(index$.getValue() + 1);
    }
  }

  executeCommand(command: commands.Command): commands.CommandResult {
    try {
      const result = this.#executeCommandUnsafe(command);
      return result;
    } catch (error) {
      const result = commands.resultFromError(error);
      return result;
    }
  }

  #executeCommandUnsafe(command: commands.Command): commands.CommandResult {
    // pretty sure i should just switch on command.instruction......
    if (commands.isEcho(command)) {
      return this.#executeEcho(command);
    }

    if (commands.isGo(command)) {
      return this.#executeGo(command);
    }

    if (commands.isMove(command)) {
      return this.#executeMove(command);
    }

    if (commands.isTest(command)) {
      return this.#executeTest(command);
    }

    if (commands.isWrite(command)) {
      return this.#executeWrite(command);
    }

    throw new Error(`${command.instruction} not implemented`);
  }

  #executeEcho({ operands }: commands.EchoCommand): commands.CommandResult {
    const message = operands.map((op) => this.#evaluateTerm(op)).join(" ");
    const eventsToEmit = [{ type: "echo", message } as const];
    return { status: Status.ok, eventsToEmit };
  }

  #executeGo({ state }: commands.GoCommand): commands.CommandResult {
    this.setState(state.value!);

    return {
      status: Status.ok,
      setCommandIndex: 0
    };
  }

  #executeMove({ edgeKey }: commands.MoveCommand): commands.CommandResult {
    if (this.networkClient == null) {
      throw new Error("can't ask to move when i don't have a network client");
    }

    const req = {
      type: "move",
      edgeKey: this.#evaluateTerm(edgeKey)
    } as const; 

    const response = this.networkClient.request(req);

    if (response.status !== Status.ok) {
      throw new Error(`got a bad response from the network: ${response.errorMessage}`);
    }

    return { status: response.status };
  }

  #executeTest({
    leftOperand,
    rightOperand,
    comparison,
    output
  }: commands.TestCommand): commands.CommandResult {
    const leftValue = this.#evaluateTerm(leftOperand);

    if (comparison == null) {
      // TODO: special values for true/false?
      const outputValue = leftValue === "0" ? "0" : "1";
      this.#evaluateTerm(output, outputValue);
      return commands.OK_RESULT;
    }

    const rightValue = this.#evaluateTerm(rightOperand!);

    let result: boolean;
    switch (comparison.comparison) {
      case "<":
        result = leftValue < rightValue;
        break;

      case "<=":
        result = leftValue <= rightValue;
        break;

      case "=":
        result = leftValue === rightValue;
        break;

      case ">":
        result = leftValue > rightValue;
        break;

      case ">=":
        result = leftValue >= rightValue;
        break;

      case "!=":
        result = leftValue !== rightValue;
        break;
    }

    const outputValue = result ? "1" : "0";
    this.#evaluateTerm(output, outputValue);
    return commands.OK_RESULT;
  }

  #executeWrite({
    data,
    output
  }: commands.WriteCommand): commands.CommandResult {
    const outputValue = this.#evaluateTerm(data);
    this.#evaluateTerm(output, outputValue);
    return commands.OK_RESULT;
  }

  /**
   * Evaluate a `Term`. For literal terms, return their value.
   * For reference terms, access the agent's buffer.
   * This may involve deleting from the buffer.
   */
  #evaluateTerm(term: commands.Term, dataToWrite?: string): string {
    if (term.value != null) {
      return term.value;
    }

    if (term.register != null) {
      const value = this.#buffer.accessNamedRegister(term.register, dataToWrite);
      return value;
    }

    console.error("Bad term:", term);
    throw new Error("Can't evaluate term without value or register");
  }
}
