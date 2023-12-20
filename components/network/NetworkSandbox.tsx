"use client";

import React, { useEffect, useCallback, useState, useRef } from "react";
import { Network, NetworkNode } from "@/model/network";
import NetworkMonitor from "./NetworkMonitor";
import NetworkMonitorControl from "./NetworkMonitorControl";
import { Agent } from "@/model/agent";
import { AgentCommand } from "@/model/agent/commands";

function setupTestNetwork(): Network {
  const network = new Network(`testnet-${Date.now()}`);
  network.addNode;
  return network;
}

export default function NetworkSandbox() {
  const networkRef = useRef(setupTestNetwork());
  const network = networkRef.current;
  const [mostRecentNode, setMostRecentNode] = useState<NetworkNode>();
  const [mostRecentAgent, setMostRecentAgent] = useState<Agent>();

  const testAddNode = useCallback(() => {
    const node = { name: "node-" + Date.now(), agents: [] } satisfies NetworkNode;
    const edgesOut = mostRecentNode != null ? [{ from: mostRecentNode, to: node }] : undefined;
    network.addNode(node, edgesOut);
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
    <NetworkMonitorControl onClick={testAddNode}>
        add node
    </NetworkMonitorControl>
  );

  return (
    <div className="flex flex-col">
      <NetworkMonitor network={network} />
      {addNodeControl}
      <NetworkMonitorControl onClick={testAddAgent}>
        add agent
      </NetworkMonitorControl>
      <NetworkMonitorControl onClick={testAddCommand}>
        add echo to {mostRecentAgent?.name}
      </NetworkMonitorControl>
      <NetworkMonitorControl onClick={testTest}>
        test process
      </NetworkMonitorControl>
    </div>
  );
}



