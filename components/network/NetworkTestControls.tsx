import React, { useCallback, useContext, useState } from "react";

import { useStateSubscription } from "@/hooks";
import { Agent } from "@/model/agent";
import { Card, Flex, Heading } from "@radix-ui/themes";
import Button from "@/components/ui/Button";
import { GameContext } from "../game/GameContext";
import { AgentFactory } from "@/model/agent/AgentFactory";

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
  const { network } = useContext(GameContext);
  const nodes = useStateSubscription(network.nodes$, []);
  const [mostRecentAgent, setMostRecentAgent] = useState<Agent>();

  const testAddNode = useCallback(() => {
    const node = network.addNode([]);

    const others = nodes.filter((otherNode) => otherNode !== node);
    const p = 1 / others.length;
    for (const otherNode of others) {
      if (Math.random() < p) {
        network.addEdge([], node, otherNode);
      }

      if (Math.random() < p) {
        network.addEdge([], otherNode, node);
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

    network.addAgent(agent, node);
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
    <Card>
      <Flex gap="2" align="center">
        <Heading size="3">test controls</Heading>
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
    </Card>
  );
}
