import React, { useCallback, useContext, useState } from "react";

import { NetworkNode } from "@/model/network";

import { useStateSubscription } from "@/hooks";
import { Agent } from "@/model/agent";
import { Card, Flex, Heading } from "@radix-ui/themes";
import Button from "@/components/ui/Button";
import { NetworkContext } from "./NetworkContext";
import { timestamp } from "@/utils";
import { AgentCommand } from "@/model/agent/commands";

export type NetworkTestControlsProps = { // TODO
};

export default function NetworkTestControls({}: NetworkTestControlsProps) {
  const network = useContext(NetworkContext);
  const nodes = useStateSubscription(network.nodes$, []);
  const [mostRecentAgent, setMostRecentAgent] = useState<Agent>();
  const mostRecentNode = nodes.at(-1);

  const testAddNode = useCallback(() => {
    const _timestamp = timestamp();
    const node = network.addNode(_timestamp);

    const others = nodes.filter((_node) => _node !== node);
    const p = 1 / others.length;
    for (const otherNode of others) {
      if (Math.random() < p) {
        network.addEdge(String(p) + "-1", node, otherNode);
      }

      if (Math.random() < p) {
        network.addEdge(String(p) + "-2", otherNode, node);
      }
    }
  }, [mostRecentNode]);

  const testAddAgent = useCallback(() => {
    console.log("trying add agent", network);

    if (mostRecentNode == null) {
      console.log("nowhere to add");
      return;
    }

    const agent = new Agent();
    agent.events$.subscribe((event) => console.log(`agent event in node ${mostRecentNode.name}`, event));
    network.addAgent(agent, mostRecentNode);
    setMostRecentAgent(() => agent);
  }, [mostRecentNode]);

  const testAddEcho = () => {
    // mostRecentAgent?.queueCommand(new AgentCommand("echo", `hey queued ${Date.now()}`));
    mostRecentAgent?.queueCommand({ instruction: "echo", message: `hey queued ${Date.now()}` });
  };
  
  const testAddMove = () => {
    mostRecentAgent?.queueCommand(new AgentCommand("move", "TODO"));
  };

  const testProcess = () => {
    network.agents.forEach((agent) => {
      agent.process();
    });
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
        <Button onClick={testAddEcho}>
          add echo
        </Button>
        <Button onClick={testAddMove}>
          add move
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
