import React, { useCallback, useContext, useState } from "react";

import { useSubscription, useStateSubscription } from "@/hooks";
import { Agent } from "@/model/agent";
import Flex from "@/components/ui/Flex";
import Heading from "@/components/ui/Heading";
import Button from "@/components/ui/Button";
import { GameContext } from "../game/GameContext";
import { AgentFactory } from "@/model/agent/AgentFactory";
import Panel from "../ui/Panel";

const TEST_PROGRAM = `def start
echo hey1
echo hey2
go loop

def loop
move f
echo woo2
go start
`;

export default function NetworkTestControls() {
  // const network = useContext(GameContext).game.network!; // TODO: remove non null assert
  // const nodes = useStateSubscription(network.nodes$, []);
  const game = useContext(GameContext).game;
  const networkView = useStateSubscription(game.networkView$, game.getNetworkView());
  const [network, setNetwork] = useState(game.getNetworkView()?.network);
  const [nodes, setNodes] = useState(network?.getNodes() ?? []);

  useSubscription(game.networkView$, (networkView) => {
    setNetwork(networkView?.network);
  });

  const [mostRecentAgent, setMostRecentAgent] = useState<Agent>();

  const testAddNode = useCallback(() => {
    const node = network.addNode();

    const others = nodes.filter((otherNode) => otherNode !== node);
    const p = 1 / others.length;
    for (const otherNode of others) {
      if (Math.random() < p) {
        network.addEdge({ from: node, to: otherNode, key: String(p) });
      }

      if (Math.random() < p) {
        network.addEdge({ from: otherNode, to: node, key: String(p) });
      }
    }
  }, [nodes]);

  const testAddAgent = useCallback(() => {
    console.log("trying add agent", network);

    const rand1 = Math.random();
    const agent = rand1 > 0.5 ? AgentFactory.circle(`c-${rand1}`) : AgentFactory.zigzag(`z-${rand1}`);

    const rand2 = Math.random();
    const nodes = [...network.nodesByName.values()];
    const node = nodes[Math.floor(rand2 * nodes.length)];

    network.joinAgent(agent, node);
    setMostRecentAgent(agent);
  }, [network]);

  const testProcess = () => {
    network.process();
  };

  const testReprogram = () => {
    mostRecentAgent?.reprogram(TEST_PROGRAM);
  };

  const testGoHome = () => window.location.hash = "#";

  const addNodeControl = (
    <Button onClick={testAddNode}>
        add node
    </Button>
  );

  return (
    <Panel className="customized-af">
      <Flex
        gap="2"
        flexDirection="row"
        align="center"
        justify="center"
        alignItems="center"
      >
        <Heading p="2">test controls</Heading>
        {addNodeControl}
        <Button onClick={testAddAgent}>
          add agent
        </Button>
        <Button onClick={testReprogram}>
          reprogram
        </Button>
        <Button onClick={testProcess}>
          test process
        </Button>
        <Button onClick={testGoHome}>
          test go home
        </Button>
      </Flex>
    </Panel>
  );
}
