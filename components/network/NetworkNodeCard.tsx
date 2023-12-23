import React, { useCallback, useMemo, useState } from "react";

import { Network, NetworkNode } from "@/model/network";
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
    console.log({ [`${node.name}-heard-that`]: event });
    // eventLogDispatch(event);
  }, [network, node]);

  const handleClickRemove = useCallback(() => {
    network.removeNode(node);
  }, [network, node]);

  const handleClickAddAgent = useCallback(() => {
    const agent = new Agent("node-agent-" + Date.now());
    network.addAgent(agent, node);
  }, [network, node]);

  /** Observable for events about this node */
  const nodeEvents$ = useMemo(() => {
    return network.events$.pipe(
      filter(isAboutNode),
      filter((event) => event.node === node)
    );
  }, [network, node]);

  useSubscription(nodeEvents$, handleNetworkNodeEvent);

  const [agents, setAgents] = useState(new Array<Agent>());
  useSubscription(node.agents$, setAgents);

  return (
    <Card>
      <Flex direction="column" gap="3" width="max-content">
        <Heading size="3">
          {node.name}
        </Heading>
        <Flex gap="3">
          <Button onClick={handleClickAddAgent}>add agent</Button>
          <Button onClick={handleClickRemove}>delete node</Button>
        </Flex>
        {agents.map((agent) => {
          return (
            <div key={agent.name}>{agent?.name}</div>
          );
        })}
      </Flex>
    </Card>
    
  );
}
