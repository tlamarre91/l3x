import { IStateful } from "./IStateful";

export class StateMachine<StateKeyType, StateDataType> implements IStateful<StateKeyType, StateDataType> {
  states: Map<StateKeyType, StateDataType>;

  currentStateKey: StateKeyType | undefined;
  currentState: StateDataType | undefined;

  constructor(states: Map<StateKeyType, StateDataType> = new Map(), initialStateKey: StateKeyType | undefined = undefined) {
    this.states = states;

    if (initialStateKey == null) {
      return;
    }

    this.currentState = this.setState(initialStateKey);
    this.currentStateKey = initialStateKey;
  }

  setState(key: StateKeyType): StateDataType{
    const newState = this.states.get(key);
    if (newState === undefined) {
      throw new Error(`ain't no state ${key}`);
    }

    this.currentStateKey = key;
    this.currentState = newState;
    return newState;
  }

  addState(key: StateKeyType, state: StateDataType): void {
    this.states.set(key, state);
  }
}

