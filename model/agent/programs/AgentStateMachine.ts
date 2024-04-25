import { BehaviorSubject, Observable } from "rxjs";

import * as commands from "./commands";
import * as parse from "./parse";
import type { SourceMap } from ".";
export interface AgentStateMachine {
  program: parse.Program;
  sourceMap: SourceMap;
  procedures: Map<string, commands.Procedure>;
}

export function emptyStateMachine() {
  const stateMachine = {
    program: { statements: [], codeLines: [] },
    sourceMap: new Map(),
    procedures: new Map()
  } satisfies AgentStateMachine;
  return stateMachine;
}

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
