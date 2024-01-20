import { BehaviorSubject, Observable } from "rxjs";

import * as commands from "@/model/agent/commands";
import * as parse from "./parse";

export type Buffer = Array<string | null>;
export const DEFAULT_BUFFER_SIZE = 32;

export function makeBuffer(size: number = DEFAULT_BUFFER_SIZE): Buffer {
  return new Array<string | null>(size);
}

export interface AgentStateMachine {
  program: parse.Program;
  sourceMap: Map<commands.AgentCommand | commands.Procedure, parse.LineAndColumn>;
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
  readonly buffer$: BehaviorSubject<Buffer>;
  readonly bufferCursor$: BehaviorSubject<number>;

  constructor() {
    this.alive$ = new BehaviorSubject(true);
    this.stateName$ = new BehaviorSubject("start");
    this.commandIndex$ = new BehaviorSubject(0);
    this.operandIndex$ = new BehaviorSubject(0);
    this.buffer$ = new BehaviorSubject(makeBuffer());
    this.bufferCursor$ = new BehaviorSubject(0);
  }

  initialize() {
    this.stateName$.next("start");
    this.commandIndex$.next(0);
    this.operandIndex$.next(0);
    this.buffer$.next(makeBuffer());
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
  readonly buffer$: Observable<Buffer>;
  readonly getBuffer: () => Buffer;
  readonly bufferCursor$: Observable<number>;
  readonly getBufferCursor: () => number;
}
