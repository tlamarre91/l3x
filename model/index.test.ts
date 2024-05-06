import { expect, it } from "vitest";
import { NetworkFactory } from "./network/NetworkFactory";
import { Agent } from "./agent";
import { NetworkEvent } from "./network/events";

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

  console.log("events:", events.length);

  expect(events).toMatchSnapshot();
  expect(network.eventLog.map((ev) => eventSnapshot(ev))).toMatchSnapshot();
});
