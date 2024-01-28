import { Observable, Subject } from "rxjs";
import { NetworkClient } from "@/model/network/NetworkClient";
import * as events from "./events";
import * as programs from "./programs";
import * as commands from "./programs/commands";
import { Program } from "./programs/parse";
import { DataDeque, DataDequeObservables } from "./programs/DataDeque";

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
    this.id = newAgentId();

    if (name == null) {
      name = `agent-${Math.floor(Math.random() * 1000000)}`;
    }
    this.name = name;

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
    // TODO: emit death knell
  }

  reprogram(code: string) {
    const program = programs.parse(code);
    const stateMachine = programs.compile(program);
    this.stateMachine = stateMachine;
    this.#executionState.initialize();
    console.log("reprogrammed", this);
  }

  setState(state: string) {
    if (!this.stateMachine.procedures.has(state)) {
      throw new Error(`state machine doesn't have state ${state}`);
    }

    this.#executionState.stateName$.next(state);
  }

  #getSelectedCommand(): commands.Command {
    const commandIndex = this.#executionState.commandIndex$.getValue();
    console.log({ commandIndex });
    const stateName = this.#executionState.stateName$.getValue();
    // console.log(this.#stateMachine.procedures);
    const procedure = this.stateMachine.procedures.get(stateName);

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

  executeCommand(command: commands.Command): commands.CommandResult {
    try {
      const result = this.#executeCommandUnsafe(command);
      return result;
    } catch (error) {
      return commands.resultFromError(error);
    }
  }

  #executeCommandUnsafe(command: commands.Command): commands.CommandResult {
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

    throw new Error(`${command.instruction} not implemented`);
  }

  #executeEcho({ operands }: commands.EchoCommand): commands.CommandResult {
    const eventsToEmit = [{ type: "echo", message: operands.join(" ") } as const];
    return { status: "ok", eventsToEmit };
  }

  #executeGo({ state }: commands.GoCommand): commands.CommandResult {
    this.setState(state.value!);

    return {
      status: "ok",
      setCommandIndex: 0
    };
  }

  #executeMove({ edgeName }: commands.MoveCommand): commands.CommandResult {
    if (this.networkClient == null) {
      throw new Error("can't ask to move when i don't have a network client");
    }

    const req = { type: "move", edgeName: edgeName.value } as const; 
    const { status, message } = this.networkClient.request(req);

    if (status !== "ok") {
      throw new Error(`got a bad response from the network: ${message}`);
    }

    return { status };
  }

  #executeTest({ leftOperand, rightOperand, comparison, output }: commands.TestCommand): commands.CommandResult {
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

  #evaluateTerm(term: commands.Term, dataToWrite?: string): string {
    console.log("evaluating term", term, "writing", dataToWrite);
    if (term.value != null) {
      console.log("literal", term.value);
      return term.value;
    }

    if (term.register != null) {
      const value = this.#buffer.accessNamedRegister(term.register, dataToWrite);
      console.log("ref", term.register, value);
      return value;
    }

    console.error("Bad term:", term);
    throw new Error("Can't evaluate term without value or register");
  }
}
