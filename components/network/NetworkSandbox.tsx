"use client";

import React, { useCallback, useState, useMemo } from "react";
import { Network, NetworkNode } from "@/model/network";
import { Agent } from "@/model/agent";
import { AgentCommand } from "@/model/agent/commands";

import NetworkMonitor from "./NetworkMonitor";
import Button from "@/components/ui/Button";
import { Card, Flex } from "@radix-ui/themes";

function setupTestNetwork(): Network {
  const network = new Network(`testnet-${Date.now()}`);
  return network;
}

export default function NetworkSandbox() {
  const network = useMemo(() => setupTestNetwork(), []);
  const [mostRecentNode, setMostRecentNode] = useState<NetworkNode>();
  const [mostRecentAgent, setMostRecentAgent] = useState<Agent>();

  const testAddNode = useCallback(() => {
    const node = { name: "node-" + Date.now(), agents: [] } satisfies NetworkNode;
    network.addNode(node);
    if (mostRecentNode != null) {
      try {
        network.addEdge(node, mostRecentNode, { name: "forward" });
      } catch (error) {
        console.error(error);
      }
      try {
        network.addEdge(mostRecentNode, node, { name: "backward" });
      } catch (error) {
        console.error(error);
      }
    }
    setMostRecentNode(() => node);
  }, [mostRecentNode]);

  const testAddAgent = useCallback(() => {
    console.log("trying add agent", network);

    if (mostRecentNode == null) {
      console.log("nowhere to add");
      return;
    }

    const agent = new Agent();
    agent.eventSubject.subscribe((event) => console.log(`agent event in node ${mostRecentNode.name}`, event));
    network.addAgent(agent, mostRecentNode);
    setMostRecentAgent(() => agent);
  }, [mostRecentNode]);

  const testAddCommand = useCallback(() => {
    mostRecentAgent?.queueCommand(new AgentCommand("echo", `hey queued ${Date.now()}`));
    console.log({ mostRecentAgent });
  }, [mostRecentAgent]);

  const testTest = useCallback(() => {
    network.agents.forEach((agent) => {console.log({ agent }); agent.process();});
  }, []);

  const addNodeControl = (
    <Button onClick={testAddNode}>
        add node
    </Button>
  );

  return (
    <Flex direction="column" p="2" m="2" gap="3">
      <Card>
        <Flex gap="2">
          {addNodeControl}
          <Button onClick={testAddAgent}>
            add agent
          </Button>
          <Button onClick={testAddCommand}>
            add echo
          </Button>
          <Button onClick={testTest}>
            test process
          </Button>
        </Flex>
      </Card>
      <NetworkMonitor network={network} />
    </Flex>
  );
}



