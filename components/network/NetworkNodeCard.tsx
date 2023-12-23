import React, { useCallback, useMemo, useState } from "react";

import { Network, NetworkEdge, NetworkNode } from "@/model/network";
import { NetworkNodeEvent, isAboutNode } from "@/model/network/events";
import { filter } from "rxjs";

import { useSubscription } from "@/hooks";
import { Agent } from "@/model/agent";
import { Card, Flex, Heading } from "@radix-ui/themes";
import Button from "@/components/ui/Button";

export type NetworkNodeCardProps = {
  network: Network<any, any>; // TODO: any
  node: NetworkNode;
  onClick?: () => void;
};

export default function NetworkNodeCard({ network, node }: NetworkNodeCardProps) {
  const handleNetworkNodeEvent = useCallback((event: NetworkNodeEvent) => {
    console.log({ [`${node.name}-heard-that-yep`]: event });
    // eventLogDispatch(event);
  }, [network, node]);

  /** Observable for events about this node */
  useSubscription(node.events$, handleNetworkNodeEvent);

  const handleClickRemove = useCallback(() => {
    network.removeNode(node);
  }, [network, node]);

  const handleClickAddAgent = useCallback(() => {
    const agent = new Agent("node-agent-" + Date.now());
    network.addAgent(agent, node);
  }, [network, node]);

  const [agents, setAgents] = useState(new Array<Agent>());
  useSubscription(node.agents$, setAgents);

  const handleClickClearAgents = useCallback(() => {

    for (const agent of agents) {
      console.log("asking to remove", agent);
      network.removeAgent(agent);
    }
  }, [network, node, agents]);

  const [edges, setEdges] = useState(new Array<NetworkEdge>());
  useSubscription(node.edges$, setEdges);

  return (
    <Card>
      <Flex direction="column" gap="3" width="max-content">
        <Heading size="3">
          {node.name}
        </Heading>
        <Flex gap="3">
          <Button onClick={handleClickAddAgent}>add agent</Button>
          <Button onClick={handleClickClearAgents}>clear</Button>
          <Button onClick={handleClickRemove}>delete</Button>
        </Flex>
        <div>
          <Heading size="2">
            agents
          </Heading>
          {agents.map((agent) => {
            return (
              <div key={agent.name}>{agent?.name}</div>
            );
          })}
        </div><div>
          <Heading size="2">
            edges
          </Heading>
          {edges.map((edge) => {
            return (
              <div key={edge.id}>{edge?.name} from {edge?.from?.name} to {edge?.to?.name}</div>
            );
          })}
        </div>
      </Flex>
    </Card>
    
  );
}
