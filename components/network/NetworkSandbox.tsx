"use client";

import React, { useEffect, useCallback, useState } from "react";
import { Network, NetworkNode } from "@/model/network";
import NetworkMonitor from "./NetworkMonitor";
import NetworkMonitorControl from "./NetworkMonitorControl";

function setupTestNetwork(): Network {
  const network = new Network("testnet");
  network.addNode;
  return network;
}

export default function NetworkSandbox() {
  const network = setupTestNetwork();
  const [mostRecentNode, setMostRecentNode] = useState<NetworkNode>();


  const testAddNode = useCallback((network: Network) => {
    const node = { name: "node-" + Date.now(), agents: [] } satisfies NetworkNode;
    const edgesOut = mostRecentNode != null ? [{ from: mostRecentNode, to: node }] : undefined;
    network.addNode(node, edgesOut);
    setMostRecentNode(() => node);
  }, [mostRecentNode]);

  const testAddAgent = useCallback((network: Network) => {
    console.log("nothin yet", network);
  }, []);

  const testTest = useCallback((network: Network) => {
    console.log({mostRecentNode, network});
  }, [mostRecentNode]);

  useEffect(() => {
    const sub = network.eventsSubject.subscribe((event) => console.log({ tester: event }));
    return () => sub.unsubscribe();
  });

  const addNodeControl = (
    <NetworkMonitorControl network={network} action={testAddNode}>
        add node
    </NetworkMonitorControl>
  );

  return (
    <div className="flex flex-col">
      <NetworkMonitor network={network} />
      {addNodeControl}
      <NetworkMonitorControl network={network} action={testAddAgent}>
        add agent
      </NetworkMonitorControl>
      <NetworkMonitorControl network={network} action={testTest}>
        test
      </NetworkMonitorControl>
    </div>
  );
}



