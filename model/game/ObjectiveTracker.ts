import { BehaviorSubject, Observable } from "rxjs";
import { Network } from "../network";
import { Objective, ObjectiveState } from "./Objective";

export class TrackedObjective {
  constructor(
    public objective: Objective,
    public state$: Observable<ObjectiveState>,
    public getState: () => ObjectiveState,
  ) {
  }
}

export class ObjectiveTracker {
  #trackedObjectiveSubject = new BehaviorSubject<TrackedObjective[]>([]);
  trackedObjectives$: Observable<TrackedObjective[]> = this.#trackedObjectiveSubject.asObservable();

  constructor(
    public watchedNetwork: Network,
    initialObjectives: Objective[] = [],
  ) {
    for (const objective of initialObjectives) {
      this.trackObjective(objective);
    }
  }

  getTrackedObjectives(): TrackedObjective[] {
    return this.#trackedObjectiveSubject.getValue();
  }

  trackObjective(objective: Objective): void {
    const currentlyTrackedObjectives = this.getTrackedObjectives();

    const alreadyTracked = currentlyTrackedObjectives.find((tracked) => tracked.objective === objective);

    if (alreadyTracked != null) {
      throw new Error("objective is already being tracked");
    }

    const [state$, getState] = objective.watch(this.watchedNetwork);
    const trackedObjective = new TrackedObjective(objective, state$, getState);

    this.#trackedObjectiveSubject.next([...currentlyTrackedObjectives, trackedObjective]);
  }
}
