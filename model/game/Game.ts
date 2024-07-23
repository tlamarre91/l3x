import { BehaviorSubject } from "rxjs";
import { Network } from "../network";
import { ObjectiveTracker } from "./ObjectiveTracker";
import { NetworkView } from "../network/NetworkView";
import { Objective } from "./Objective";
import { NetworkWatcherFactory } from "./NetworkWatcher";


export class Game {
  #networkSubject = new BehaviorSubject<Network | null>(null);
  network$ = this.#networkSubject.asObservable();
  public objectiveTracker: ObjectiveTracker;

  constructor(
    public network?: Network,
    public networkView?: NetworkView,
  ) {
    if (network == null) {
      throw new Error("TODO");
    }

    this.objectiveTracker = new ObjectiveTracker(network);

    this.tester();
  }

  // TODO: extract useful stuff
  tester() {
    const nodeName = "@n15";
    const testObjective1 = new Objective(`Get to ${nodeName}`, `Get an agent into ${nodeName}`, NetworkWatcherFactory.agentInNodeWatcher(nodeName));

    const agentName = this.network?.getAgents()[0].name!;
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

  getNetwork() {
    return this.#networkSubject.getValue();
  }
}
