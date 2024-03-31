import { BehaviorSubject } from "rxjs";
import { ObjectiveTracker } from "./ObjectiveTracker";
import { Network } from "../network";

export class Game {
  #networkSubject = new BehaviorSubject<Network | null>(null);
  network$ = this.#networkSubject.asObservable();

  constructor(
    public objectiveTracker: ObjectiveTracker = new ObjectiveTracker()
  ) {
  }

  getNetwork() {
    return this.#networkSubject.getValue();
  }
}
