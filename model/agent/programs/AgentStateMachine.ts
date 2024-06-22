import { BehaviorSubject, Observable } from "rxjs";

import * as commands from "./commands";
import * as parse from "./parse";
import type { SourceMap } from ".";

/**
 * Represent the behaviors of an `Agent` as a state machine.
 *
 * Defines a list of states the `Agent` can be in, and for each state, defines
 * a `Procedure` for the behavior in that state. Also, keep track of the original
 * program written for the agent, and a `SourceMap` mapping each procedure,
 * command and term to the location of its definition in the program.
 */
export interface AgentStateMachine {
  procedures: Map<string, commands.Procedure>;
  program: parse.Program;
  sourceMap: SourceMap;
}

export function emptyStateMachine() {
  const stateMachine = {
    procedures: new Map(),
    program: { statements: [], codeLines: [] },
    sourceMap: new Map(),
  } satisfies AgentStateMachine;
  return stateMachine;
}

/**
 * Represent the execution state of an `Agent` running an `AgentStateMachine`
 * and make parts of the state observable
 */
export class ExecutionState {
  readonly alive$: BehaviorSubject<boolean>;
  readonly stateName$: BehaviorSubject<string>;
  readonly commandIndex$: BehaviorSubject<number>;
  // TODO: do something with this
  readonly operandIndex$: BehaviorSubject<number>;

  constructor(alive = true, state = "start", commandIndex = 0, operandIndex = 0) {
    this.alive$ = new BehaviorSubject(alive);
    // TODO: extract "start" to a constant
    this.stateName$ = new BehaviorSubject(state);
    this.commandIndex$ = new BehaviorSubject(commandIndex);
    this.operandIndex$ = new BehaviorSubject(operandIndex);
  }

  initialize() {
    this.stateName$.next("start");
    // TODO: extract "start" to a constant
    this.commandIndex$.next(0);
    this.operandIndex$.next(0);
  }

  #cachedObservables: ExecutionStateObservables | undefined;

  // TODO: just make a getter for cached collection of observables
  asObservables(): ExecutionStateObservables {
    if (this.#cachedObservables == null) {
      this.#cachedObservables = {
        alive$: this.alive$.asObservable(),
        getAlive: () => this.alive$.getValue(),
        stateName$: this.stateName$.asObservable(),
        getStateName: () => this.stateName$.getValue(),
        commandIndex$: this.commandIndex$.asObservable(),
        getCommandIndex: () => this.commandIndex$.getValue(),
        operandIndex$: this.operandIndex$.asObservable(),
        getOperandIndex: () => this.operandIndex$.getValue(),
      };
    }

    return this.#cachedObservables;
  }
}

export type ExecutionStateObservables = {
  readonly alive$: Observable<boolean>;
  readonly getAlive: () => boolean;
  readonly stateName$: Observable<string>;
  readonly getStateName: () => string;
  readonly commandIndex$: Observable<number>;
  readonly getCommandIndex: () => number;
  readonly operandIndex$: Observable<number>;
  readonly getOperandIndex: () => number;
}
