import React, { useCallback, useReducer } from "react";
import { Network, NetworkNode } from "@/model/network";
import { NetworkEvent, isAddNode, isRemoveNode, isAddAgent, isRemoveAgent } from "@/model/network/events";
import { Agent } from "@/model/agent";
import { useSubscription } from "@/hooks";
import NetworkNodeCard from "./NetworkNodeCard";
import NetworkEventLog from "./NetworkEventLog";
import { Flex, Heading } from "@radix-ui/themes";

export type NetworkMonitorProps = {
  network: Network;
};

function networkNodeStateReducer(knownNodes: NetworkNode[], event: NetworkEvent): NetworkNode[] {
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
  }, [network]);

  useSubscription(network.events$, handleNetworkEvent);

  return (
    <Flex direction="column" gap="2">
      <Heading size="4">network monitor</Heading>
      <Flex direction="row" gap="2" wrap="wrap">
        {knownNodes.map((node) => (
          <NetworkNodeCard
            key={node.name}
            network={network}
            node={node}/>
        ))}
      </Flex>
      {/* TODO: yooo it'd be cool if you could click on the name of a node and have it "selected" in the window and see details*/}
      <NetworkEventLog show={{ network: false }} events$={network.events$} />
    </Flex>
  );
}

