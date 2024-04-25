import { BehaviorSubject, of, map } from "rxjs";
import { Network } from "../network";
import { Objective, ObjectiveTracker, WatchableObjectWatcher } from "./ObjectiveTracker";
import { NetworkView } from "../network/NetworkView";

export function testWatcherThatChecksIfNodeHasAnyAgents(
  nodeName: string
): WatchableObjectWatcher {
  function watcher(network: Network) {
    console.log(`gonna watch ${network.name}`);
    if (network == null) {
      const falseValue = { value: false, updatedAt: -1 };
      return [of(falseValue), () => falseValue] as const;
    }

    const nodeToWatch = network?.nodesByName.get(nodeName);
    if (nodeToWatch == null) {
      throw new Error(`Couldn't find node ${nodeName} in network ${network.name}`);
    }

    console.log(`gonna watch node ${nodeToWatch.name}`);

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

export class Game {
  #networkSubject = new BehaviorSubject<Network | null>(null);
  network$ = this.#networkSubject.asObservable();
  public objectiveTracker: ObjectiveTracker;
  // TODO: adapt tester() to watch for win state.
  // TODO: add "fail" to objective state values

  constructor(
    public network?: Network,
    public networkView?: NetworkView,
  ) {
    if (network == null) {
      throw new Error("TODO");
    }

    const name = "@n15"
    const testObjective: Objective = {
      name: "Test Objective",
      description: `Get an agent to node ${name}`,
      watchedObject: "network",
      watch: testWatcherThatChecksIfNodeHasAnyAgents(name)
    };

    const objectiveTracker: ObjectiveTracker = new ObjectiveTracker(network);
    objectiveTracker.trackObjective(testObjective);
    objectiveTracker.trackedObjectives$.subscribe((thing) => {
      console.log("lookit the tracked objectives:");
      console.log(thing);
    });

    this.objectiveTracker = objectiveTracker;

    this.tester();
  }

  tester() {
    const objs = this.objectiveTracker.getTrackedObjectives();
    for (const objective of objs) {
      objective.state$.subscribe((state) => {
        console.log(`new state for objective "${objective.name}": ${JSON.stringify(state)}`);
      });
    }
  }

  getNetwork() {
    return this.#networkSubject.getValue();
  }
}
