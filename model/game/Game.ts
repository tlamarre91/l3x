import { BehaviorSubject } from "rxjs";
import { ObjectiveTracker } from "./ObjectiveTracker";
import { Network } from "../network";

export class Game {
  #networkSubject = new BehaviorSubject<L3xNetwork | null>(null);
  network$ = this.#networkSubject.asObservable();

  constructor() {
    const objectiveTracker = new ObjectiveTracker();
  }

  getNetwork() {
    return this.#networkSubject.getValue();
  }
}
