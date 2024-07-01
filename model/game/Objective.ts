import { Observable } from "rxjs";
import { NetworkWatcher } from "./NetworkWatcher";

// TODO: somethin'
export type ObjectiveStateValue = "pass" | "fail" | "permafail"

export class ObjectiveState {
  constructor(
    public value: ObjectiveStateValue,
    public lastChangedAt: number,
  ) {
  }
}

export class Objective {
  constructor(
    public name: string,
    public description: string,
    public watch: NetworkWatcher,
  ) {
  }
}
