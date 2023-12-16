export interface IStateful<StateKeyType, StateDataType> {
  currentStateKey: StateKeyType | undefined;
  currentState: StateDataType | undefined;
  setState(key: StateKeyType): StateDataType;
  addState(key: StateKeyType, state: StateDataType): void;
}

