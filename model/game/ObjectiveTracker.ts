import { BehaviorSubject, Observable, map, of } from "rxjs";
import { Network } from "../network";
import { NotImplementedError, ObservableAndGetter } from "../types";

export interface ObjectiveState {
  value: boolean;
  updatedAt: number;
}

type WatchableObject = Network;
export type WatchableObjectWatcher = (object: WatchableObject) => ObservableAndGetter<ObjectiveState>;

export interface Objective {
  name: string;
  description: string;
  watchedObject: "network";
  watch: WatchableObjectWatcher;
  state$?: Observable<ObjectiveState>;
  getState?(): ObjectiveState;
}

export interface TrackedObjective extends Objective {
  state$: Observable<ObjectiveState>;
  getState(): ObjectiveState;
}

export function isTrackedObjective(objective: Objective): objective is TrackedObjective {
  return objective.state$ != null || objective.getState != null;
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

  trackObjective(objective: Objective): TrackedObjective {
    if (objective.watchedObject !== "network") {
      throw new NotImplementedError("can only watch network for now");
    }

    const currentlyTrackedObjectives = this.#trackedObjectiveSubject.getValue();

    if (currentlyTrackedObjectives.includes(objective as TrackedObjective)) {
      throw new Error("objective is already being tracked");
    }

    if (isTrackedObjective(objective)) {
      throw new Error("objective is already being tracked somewhere else??");
    }

    const [state$, getState] = objective.watch(this.watchedNetwork);

    const trackedObjective = {
      ...objective,
      state$,
      getState
    };

    this.#trackedObjectiveSubject.next([...currentlyTrackedObjectives, trackedObjective]);

    return trackedObjective;
  }
}
