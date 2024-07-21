import { expect, it } from "vitest";
import { NetworkFactory } from "./network/NetworkFactory";
import { Agent } from "./agent";
import { NetworkEvent } from "./network/events";
import { Objective } from "./game/Objective";
import { NetworkWatcherFactory } from "./game/NetworkWatcher";
import { ObjectiveTracker } from "./game/ObjectiveTracker";

function eventSnapshot(ev: NetworkEvent): unknown {
  const snapshot = {
    type: ev.type,
    id: ev.id, 
    node: ev.node?.name,
    agent: ev.agent?.name,
    edge: ev.edge?.name,
    edgeKey: ev.edge?.key,
    edgeFrom: ev.edge?.from.name,
    edgeTo: ev.edge?.to.name,
    agentevent: ev.emitted?.type
  };

  return snapshot;
}

it("grid network with 2 simple agents", () => {
  const [network, _networkView] = NetworkFactory.grid(5, 5, { logEvents: true });
  const events: unknown[] = [];

  network.events$.subscribe((ev) => {
    events.push(eventSnapshot(ev));
  });

  const nodes = [...network.nodesByName.values()];

  const ZIGZAG_PROGRAM = `def start
write right $f
move $pf
write i'm
test here = $pf
write here
test here = $pf
go l1

def l1
move down
go start
`;
  const agent1 = Agent.fromCode("zigzaggy", ZIGZAG_PROGRAM);
  network.joinAgent(agent1, nodes[0]);

  const CIRCLE_PROGRAM = `def start
move right
move right
move right
move down
move down
move down
move left
move left
move left
move up
move up
move up
go start
`;
  const agent2 = Agent.fromCode("circleguy", CIRCLE_PROGRAM);
  network.joinAgent(agent2, nodes[1]);

  for (let i = 0; i < 250; i += 1) {
    network.process();
  }

  expect(events).toMatchSnapshot();
  expect(network.eventLog.map((ev) => eventSnapshot(ev))).toMatchSnapshot();
});

it("line network with objective trackers", () => {
  const [network, _networkView] = NetworkFactory.line(8, { logEvents: true });

  // TODO: extract to test setup helper
  const objectiveStateEvents: unknown[] = [];

  const LINE_PROGRAM = `def start
move forward
move forward
move forward
move forward
move forward
move forward
write The-Secret
move back
move back
move back
move back
move back
test $pf
go start
`;
  const agent = Agent.fromCode("ayygent", LINE_PROGRAM);
  network.joinAgent(agent, network.getNodes()[0]);

  const nodeName = "@n4";
  const testObjective1 = new Objective(`Get to ${nodeName}`, `Get an agent into ${nodeName}`, NetworkWatcherFactory.agentInNodeWatcher(nodeName));

  const agentName = agent.name;
  const magicWord = "The-Secret";
  const testObjective2 = new Objective(
    `Teach ${agentName} to say ${magicWord}`,
    `Agent ${agentName} should have "${magicWord}" in its datadeque`,
    NetworkWatcherFactory.agentKnowsWordWatcher(agentName, magicWord)
  );

  const objectiveTracker = new ObjectiveTracker(network)

  objectiveTracker.trackObjective(testObjective1);
  objectiveTracker.trackObjective(testObjective2);

  const trackedObjectives = objectiveTracker.getTrackedObjectives();
  for (const trackedObjective of trackedObjectives) {
    trackedObjective.state$.subscribe((state) => {
      objectiveStateEvents.push(`new state for objective "${trackedObjective.objective.name}": ${JSON.stringify(state)}`);
    });
  }

  const ITERS = 103;
  for (let i = 0; i < ITERS; i += 1) {
    network.process();
  }

  expect(objectiveStateEvents).toMatchSnapshot();
  expect(network.eventLog.map((ev) => eventSnapshot(ev))).toMatchSnapshot();
});
