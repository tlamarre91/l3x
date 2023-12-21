import React, { useCallback, useReducer } from "react";
import { Network, NetworkNode } from "@/model/network";
import { NetworkEvent, SequentialNetworkEvent, isAddNode, isRemoveNode, isAddAgent, isRemoveAgent } from "@/model/network/events";
import { Agent } from "@/model/agent";
import { useSubscription } from "@/hooks";
import NetworkNodeCard from "./NetworkNodeCard";
import NetworkEventLog from "./NetworkEventLog";

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

function eventLogReducer(eventLog: SequentialNetworkEvent[], event: SequentialNetworkEvent) {
  return [...eventLog, event];
}

export default function NetworkMonitor({ network }: NetworkMonitorProps) {
  // const [knownAgents, knownAgentsDispatch] = useReducer(networkAgentStateReducer, []);
  const [knownNodes, knownNodesDispatch] = useReducer(networkNodeStateReducer, []);
  const [eventLog, eventLogDispatch] = useReducer(eventLogReducer, []);

  const handleNetworkEvent = useCallback((event: SequentialNetworkEvent) => {
    console.log(`NetworkMonitor got an event for network ${network.name}!`);
    knownNodesDispatch(event);
    eventLogDispatch(event);
  }, [network]);

  useSubscription(network.events$, handleNetworkEvent);

  return (
    <div className="w-full">
      <div className="font-bold">Network Monitor</div>
      <div className="grid grid-cols-12">
        <div className="col-span-4">
          {knownNodes.map((node) => (
            <NetworkNodeCard
              key={node.name}
              network={network}
              node={node}/>
          ))}
        </div>
        <div className="col-span-8">
          <NetworkEventLog events={eventLog} />
        </div>
      </div>
    </div>
  );
}

