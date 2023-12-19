import React, { useCallback, useEffect, useReducer } from "react";
import { Network, NetworkNode } from "@/model/network";
import { NetworkEvent, isAddNode, isRemoveNode, isAddAgent, isRemoveAgent } from "@/model/network/events";
import { Agent } from "@/model/agent";

export type NetworkMonitorProps = {
  network: Network;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function networkAgentStateReducer(knownAgents: Agent[], event: NetworkEvent) {
  console.log("REDUCE!");
  console.log({ knownAgents });
  console.log({ event });
  if (isAddAgent(event)) {
    return [...knownAgents, event.agent];
  }

  if (isRemoveAgent(event)) {
    return knownAgents.filter((agent) => agent !== event.agent);
  }

  return knownAgents;
}

function networkNodeStateReducer(knownNodes: NetworkNode[], event: NetworkEvent) {
  if (isAddNode(event)) {
    return [...knownNodes, event.node];
  }

  if (isRemoveNode(event)) {
    return knownNodes.filter((node) => node !== event.node);
  }

  return knownNodes;
}

export default function NetworkMonitor({ network }: NetworkMonitorProps) {
  // const [knownAgents, knownAgentsDispatch] = useReducer(networkAgentStateReducer, []);
  const [knownNodes, knownNodesDispatch] = useReducer(networkNodeStateReducer, []);

  const handleNetworkEvent = useCallback((event: NetworkEvent) => {
    console.log(`NetworkMonitor got an event for network ${network.name}!`);
    knownNodesDispatch(event);
  }, []);

  useEffect(() => {
    const subscription = network.eventsSubject.subscribe(handleNetworkEvent);
    return () => subscription.unsubscribe();
  }, [network]);

  return (
    <>
      <div>Network Monitor</div>
      {knownNodes.map((node) => <div key={node.name}>{node.name}</div>)}
    </>
  );
}

