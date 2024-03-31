import { BehaviorSubject, Observable, map, of } from "rxjs";
import { Network } from "../network";
import { ObservableAndGetter } from "../types";

export interface ObjectiveState {
  value: boolean;
  updatedAt: number;
}

type MaybeNetwork = Network | undefined;
type WatchableObject = MaybeNetwork;
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

export function testWatcherThatChecksIfNodeHasAnyAgents(nodeName: string): WatchableObjectWatcher {
  // let nodeAgentsSubscription: Subscription | undefined;

  function watcher(network: MaybeNetwork) {
    if (network == null) {
      // nodeAgentsSubscription = undefined;
      const falseValue = { value: false, updatedAt: -1 };
      return [of(falseValue), () => falseValue] as const;
    }

    const nodeToWatch = network?.nodesByName.get(nodeName);
    if (nodeToWatch == null) {
      throw new Error(`Couldn't find node ${nodeName} in network ${network.name}`);
    }

    const state$ = nodeToWatch.agents$.pipe(map((agents) => {
      return {
        value: agents.length !== 0,
        updatedAt: network.clockCount
      };
    }));

    const getState = () => {
      return {
        value: nodeToWatch.getAgents().length !== 0,
        updatedAt: network.clockCount
      };
    };

    return [state$, getState] as const;
  }

  return watcher;
}

export class ObjectiveTracker {
  #trackedObjectiveSubject = new BehaviorSubject<TrackedObjective[]>([]);
  trackedObjectives$: Observable<TrackedObjective[]> = this.#trackedObjectiveSubject.asObservable();
  #watchedNetworkSubject = new BehaviorSubject<MaybeNetwork>(undefined);

  constructor(
    initialObjectives: Objective[] = [],
    watchedNetwork?: Network
  ) {
    if (watchedNetwork != null) {
      this.#watchedNetworkSubject.next(watchedNetwork);
    }

    for (const objective of initialObjectives) {
      this.trackObjective(objective);
    }

    this.#watchedNetworkSubject.subscribe((network) => this.handleNetworkChange(network));
  }

  trackObjective(objective: Objective): TrackedObjective {
    if (objective.watchedObject !== "network") {
      throw new Error("can only watch network!");
    }

    if (this.#trackedObjectiveSubject.getValue().includes(objective as TrackedObjective)) {
      throw new Error("objective is already being tracked");
    }

    if (isTrackedObjective(objective)) {
      throw new Error("objective is already being tracked somewhere else??");
    }

    const [state$, getState] = objective.watch(this.#watchedNetworkSubject.getValue());

    const trackedObjective = {
      ...objective,
      state$,
      getState
    };

    return trackedObjective;
  }

  handleNetworkChange(network: MaybeNetwork) {
    for (const trackedObjective of this.#trackedObjectiveSubject.getValue()) {
      const [state$, getState] = trackedObjective.watch(network);
      trackedObjective.state$ = state$;
      trackedObjective.getState = getState;
      // TODO: can i get away with this or is it a memory leak?
      // i think this is fine because watch() only returns an observable, doesn't subscribe
    }
  }

  watchNetwork(network: Network) {
    this.#watchedNetworkSubject.next(network);
  }
}
