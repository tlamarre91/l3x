"use client";

import React, { useCallback, useEffect, useReducer } from "react";
import { Network } from "@/model/network";
import { NetworkEvent } from "@/model/network/events";
import { Agent } from "@/model/agent";

export type NetworkMonitorProps = {
  network: Network;
};

function networkAgentStateReducer(knownAgents: Agent[], event: NetworkEvent) {
  console.log(`REDUCE! ${knownAgents} ${event}`);
  if (event.isAddAgent()) {
    return [...knownAgents, event.agent];
  }

  if (event.isRemoveAgent()) {
    return knownAgents.filter((agent) => agent !== event.agent);
  }

  return knownAgents;
}

export default function NetworkMonitor({ network }: NetworkMonitorProps) {
  const [knownAgents, knownAgentsDispatch] = useReducer(networkAgentStateReducer, []);

  const handleNetworkEvent = useCallback((event: NetworkEvent) => {
    console.log(`NetworkMonitor got an event for network ${network.name}!`);
    console.log({ knownAgents });
    knownAgentsDispatch(event);
  }, []);

  useEffect(() => {
    const subscription = network.eventsSubject.subscribe(handleNetworkEvent);
    return () => subscription.unsubscribe();
  }, [network]);

  return (
    <div>Network Monitor</div>
  );
}

