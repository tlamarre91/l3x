import { BehaviorSubject, Observable } from "rxjs";

import * as commands from "@/model/agent/commands";
import * as parse from "./parse";
import type { SourceMap } from ".";

export const NamedRegisters = {
  cursor: "$c",
  /** same as cursor, but move the cursor left after reading */
  cursorDec: "$cd",
  /** same as cursor, but move the cursor right after reading */
  cursorInc: "$ci",
  front: "$f",
  back: "$b",
  popCursor: "$pc",
  /** same as popCursor, but move the cursor left */
  popCursorDec: "$pd",
  popFront: "$pf",
  popBack: "$pb",
} as const;

export type NamedRegister = typeof NamedRegisters[keyof typeof NamedRegisters];

export function isNamedRegister(s: string | undefined): s is NamedRegister {
  const isNamedRegister = Object.values(NamedRegisters).includes(s as NamedRegister);
  return isNamedRegister;
}

export class StringDeque {
  cursorIndex = 0;
  frontIndex = 0;
  backIndex = 0;

  #array: Array<string>;

  constructor(public capacity: number) {
    this.#array = [];
  }

  get length() {
    let sum = 0;
    for (const s of this.#array) {
      sum += s.length + 1; // add 1 for the space between strings
    }

    return sum;
  }

  getCursor() {
  }

  getCursorDec() {
  }

  getCursorInc() {
  }

  getFront() {
  }

  getBack() {
  }

  pushFront() {
  }

  pushBack() {
  }

  popFront() {
  }

  popBack() {
  }
}
export const DEFAULT_BUFFER_SIZE = 32;

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
  readonly operandIndex$: BehaviorSubject<number>;
  readonly buffer$: BehaviorSubject<StringDeque>;
  readonly bufferCursor$: BehaviorSubject<number>;

  constructor() {
    this.alive$ = new BehaviorSubject(true);
    this.stateName$ = new BehaviorSubject("start");
    this.commandIndex$ = new BehaviorSubject(0);
    this.operandIndex$ = new BehaviorSubject(0);
    this.buffer$ = new BehaviorSubject(new StringDeque(64));
    this.bufferCursor$ = new BehaviorSubject(0);
  }

  initialize() {
    this.stateName$.next("start");
    this.commandIndex$.next(0);
    this.operandIndex$.next(0);
    this.buffer$.next(new StringDeque(64));
    this.bufferCursor$.next(0);
  }

  asObservables(): ExecutionStateObservable {
    return {
      alive$: this.alive$.asObservable(),
      getAlive: () => this.alive$.getValue(),
      stateName$: this.stateName$.asObservable(),
      getStateName: () => this.stateName$.getValue(),
      commandIndex$: this.commandIndex$.asObservable(),
      getCommandIndex: () => this.commandIndex$.getValue(),
      operandIndex$: this.operandIndex$.asObservable(),
      getOperandIndex: () => this.operandIndex$.getValue(),
      buffer$: this.buffer$.asObservable(),
      getBuffer: () => this.buffer$.getValue(),
      bufferCursor$: this.bufferCursor$.asObservable(),
      getBufferCursor: () => this.bufferCursor$.getValue(),
    };
  }
}

export type ExecutionStateObservable = {
  readonly alive$: Observable<boolean>;
  readonly getAlive: () => boolean;
  readonly stateName$: Observable<string>;
  readonly getStateName: () => string;
  readonly commandIndex$: Observable<number>;
  readonly getCommandIndex: () => number;
  readonly operandIndex$: Observable<number>;
  readonly getOperandIndex: () => number;
  readonly buffer$: Observable<StringDeque>;
  readonly getBuffer: () => StringDeque;
  readonly bufferCursor$: Observable<number>;
  readonly getBufferCursor: () => number;
}
