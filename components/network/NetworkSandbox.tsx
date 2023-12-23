"use client";

import React, { useCallback, useState, useMemo, useEffect } from "react";
import { Network, NetworkNode } from "@/model/network";
import { Agent } from "@/model/agent";
import { AgentCommand } from "@/model/agent/commands";

import NetworkMonitor from "./NetworkMonitor";
import Button from "@/components/ui/Button";
import { Card, Flex } from "@radix-ui/themes";

function timestamp() {
  return String(Date.now()).slice(-8);
}

export type NetworkSandboxProps = {
  query?: string;
}

function setupTestNetwork(): Network<string, string> {
  const network = new Network<string, string>(`testnet-${timestamp()}`);
  return network;
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

  const network = useMemo(() => setupTestNetwork(), []);
  const [mostRecentNode, setMostRecentNode] = useState<NetworkNode<string>>();
  const [mostRecentAgent, setMostRecentAgent] = useState<Agent>();

  const testAddNode = useCallback(() => {
    const _timestamp = timestamp();
    const node = network.addNode("sandbox-" + _timestamp);

    if (mostRecentNode != null) {
      try {
        network.addEdge(_timestamp, node, mostRecentNode, "backward");
      } catch (error) {
        console.warn(error);
      }
      try {
        network.addEdge(_timestamp, mostRecentNode, node, "forward");
      } catch (error) {
        console.warn(error);
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

  const testGoHome = () => window.location.hash = "#";

  const addNodeControl = (
    <Button onClick={testAddNode}>
        add node
    </Button>
  );

  const monitorView = (
    <NetworkMonitor network={network} />
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
    <Flex direction="column" p="2" m="2" gap="2">
      query: {fragmentId}
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
          <Button onClick={testGoHome}>
            test go home
          </Button>
        </Flex>
      </Card>
      {nodeView || monitorView}
    </Flex>
  );
}



