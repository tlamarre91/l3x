import { BehaviorSubject, Observable, Subscription, map, of } from "rxjs";
import { NetworkEvent } from "../network/events";
import { Network } from "../network";
import { ObservableAndGetter } from "../types";

export interface ObjectiveState {
  value: boolean;
  updatedAt: number;
}

type MaybeNetwork = Network<unknown, unknown> | undefined;
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

export function testWatcherThatChecksIfNodeHasAnyAgents(nodeName: string): WatchableObjectWatcher {
  let nodeAgentsSubscription: Subscription | undefined;
  function watcher(network: MaybeNetwork) {
    if (network == null) {
      nodeAgentsSubscription = undefined;
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
      }
    }));

    const getState = () => {
      return {
        value: nodeToWatch.getAgents().length !== 0,
        updatedAt: network.clockCount
      };
    }

    return [state$, getState] as const;
  }

  return watcher;
}

export class ObjectiveTracker {
  state$: Observable<Objective[]>;
  #stateSubject = new BehaviorSubject<Objective[]>([]);
  #watchedNetworkSubject = new BehaviorSubject<MaybeNetwork>(undefined);

  constructor(
    initialObjectives: Objective[] = [],
    watchedNetwork?: Network<unknown, unknown>
  ) {
    if (watchedNetwork != null) {
      this.#watchedNetworkSubject.next(watchedNetwork);
    }

    for (const objective of initialObjectives) {
      this.trackObjective(objective);
    }

    const statefulObjectives = initialObjectives.map((obj) => this.trackObjective(obj));

    this.#stateSubject = new BehaviorSubject(statefulObjectives);
    this.state$ = this.#stateSubject.asObservable();
  }

  trackObjective(objective: Objective): Objective {
    if (objective.watchedObject !== "network") {
      throw new Error("can only watch network!");
    }

    // TODO

    // const stateSubject = objective.watch(this.#watchedNetworkSubject);
    //
    // const statefulObjective = {
    //   ...objective,
    //   state$: stateSubject.asObservable(),
    //   getState: stateSubject.getValue
    // };
    // return statefulObjective;
  }
}
