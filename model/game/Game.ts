import { BehaviorSubject } from "rxjs";
import { Network } from "../network";
import { ObjectiveTracker } from "./ObjectiveTracker";
import { NetworkView } from "../network/NetworkView";
import { Objective } from "./Objective";
import { NetworkWatcherFactory } from "./NetworkWatcher";


export class Game {
  #networkViewSubject = new BehaviorSubject<NetworkView | null>(null);
  networkView$ = this.#networkViewSubject.asObservable();
  public objectiveTracker?: ObjectiveTracker;

  constructor(
    networkView?: NetworkView,
  ) {
    this.#networkViewSubject.next(networkView ?? null);
    this.#networkViewSubject.subscribe((networkView) => {
      if (networkView != null) {
        this.objectiveTracker = new ObjectiveTracker(networkView.network);
      }
    });

    if (networkView == null) {
      return;
    }

    this.tester(); // TODO: delete
  }

  setActiveNetwork(networkView: NetworkView) {
    this.#networkViewSubject.next(networkView);
  }

  // TODO: extract useful stuff
  tester() {
    const nodeName = "@n15";
    const testObjective1 = new Objective(`Get to ${nodeName}`, `Get an agent into ${nodeName}`, NetworkWatcherFactory.agentInNodeWatcher(nodeName));

    const network = this.getNetworkView()!.network;

    const agentName = network.getAgents()[0].name!;
    const magicWord = "here";
    const testObjective2 = new Objective(
      `Teach ${agentName} to say ${magicWord}`,
      `Agent ${agentName} should have "${magicWord}" in its datadeque`,
      NetworkWatcherFactory.agentKnowsWordWatcher(agentName, magicWord)
    );

    this.objectiveTracker.trackObjective(testObjective1);
    this.objectiveTracker.trackObjective(testObjective2);

    const trackedObjectives = this.objectiveTracker.getTrackedObjectives();
    for (const trackedObjective of trackedObjectives) {
      trackedObjective.state$.subscribe((state) => {
        console.log(`new state for objective "${trackedObjective.objective.name}": ${JSON.stringify(state)}`);
      });
    }
  }

  // TODO: finish switching to subscribable network
  getNetworkView() {
    return this.#networkViewSubject.getValue();
  }
}
