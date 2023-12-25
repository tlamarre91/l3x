"use client";

import React, { useCallback, useState, useMemo, useEffect, useContext } from "react";
import { Network, NetworkNode } from "@/model/network";
import { Agent } from "@/model/agent";
import { AgentCommand } from "@/model/agent/commands";

import NetworkMonitor from "./NetworkMonitor";
import { NetworkContext } from "./NetworkContext";

import Button from "@/components/ui/Button";
import { Card, Flex } from "@radix-ui/themes";
import { useStateSubscription } from "@/hooks";

function timestamp() {
  return String(Date.now()).slice(-8);
}

export type NetworkSandboxProps = {
  query?: string;
}

export default function NetworkSandbox() {
  const [fragmentId, setFragmentId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handle = () => setFragmentId(window.location.hash);

    addEventListener("hashchange", handle);
    handle();

    return () => {
      removeEventListener("hashchange", handle);
    };
  }, []);

  const network = useContext(NetworkContext);
  const [mostRecentAgent, setMostRecentAgent] = useState<Agent>();
  const nodes = useStateSubscription(network.nodes$, []);
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
    agent.eventSubject.subscribe((event) => console.log(`agent event in node ${mostRecentNode.name}`, event));
    network.addAgent(agent, mostRecentNode);
    setMostRecentAgent(() => agent);
  }, [mostRecentNode]);

  const testAddEcho = () => {
    mostRecentAgent?.queueCommand(new AgentCommand("echo", `hey queued ${Date.now()}`));
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

  const monitorView = (
    <NetworkMonitor />
  );

  const nodeView = useMemo(() => {
    if (fragmentId == null) {
      return null;
    }

    const [keyType, key] = fragmentId.split(":");
    if (keyType !== "#node") {
      return null;
    }

    return key;
  }, [fragmentId]);

  return (
    <NetworkContext.Provider value={network}>
      <Flex direction="column" p="2" m="2" gap="2">
        query: {fragmentId}
        <Card>
          <Flex gap="2">
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
        {nodeView || monitorView}
      </Flex>
    </NetworkContext.Provider>
  );
}



