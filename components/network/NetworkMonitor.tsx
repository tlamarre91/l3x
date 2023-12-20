import React, { useCallback, useEffect, useReducer, useState } from "react";
import { Network, NetworkNode } from "@/model/network";
import { NetworkEvent, isAddNode, isRemoveNode, isAddAgent, isRemoveAgent } from "@/model/network/events";
import { Agent } from "@/model/agent";
import { useSubscription } from "@/hooks";
import NetworkNodeCard from "./NetworkNodeCard";

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

function eventLogReducer(eventLog: any[], event: any) {
  return [...eventLog, event];
}

export default function NetworkMonitor({ network }: NetworkMonitorProps) {
  // const [knownAgents, knownAgentsDispatch] = useReducer(networkAgentStateReducer, []);
  const [knownNodes, knownNodesDispatch] = useReducer(networkNodeStateReducer, []);
  const [eventLog, eventLogDispatch] = useReducer(eventLogReducer, []);

  const handleNetworkEvent = useCallback((event: NetworkEvent) => {
    console.log(`NetworkMonitor got an event for network ${network.name}!`);
    knownNodesDispatch(event);
    // eventLogDispatch({ networkname: event.network.name, type: event.type, nodename: event?.node?.name, edgespec: event.edgeSpec });
    eventLogDispatch(event);
  }, [network]);

  useSubscription(network.eventsSubject, handleNetworkEvent);

  return (
    <>
      <div>Network Monitor</div>
      {knownNodes.map((node, i) => <NetworkNodeCard key={i} network={network} node={node}/>)}
      <div id="eventLog">
        {eventLog.map((ev, i) => <div key={i}>{ev.toString()}</div>)}
      </div>
    </>
  );
}

