import React, { useCallback, useMemo, useReducer } from "react";

import { Network, NetworkNode } from "@/model/network";
import { NetworkEvent, NetworkNodeEvent, isAboutAgent, isAboutNode } from "@/model/network/events";
import { filter } from "rxjs";

import { useSubscription } from "@/hooks";
import { Agent } from "@/model/agent";
import { Box, Card, Flex, Heading } from "@radix-ui/themes";
import Button from "@/components/ui/Button";
import { Sequential } from "@/model/types";

export type NetworkNodeCardProps = {
  network: Network;
  node: NetworkNode;
  onClick?: () => void;
};

// function eventReducer(events: NetworkEvent[], event: NetworkEvent) {
//   return [...events, event];
// }

function agentsReducer(agents: Agent[], event: NetworkEvent) {
  switch (event.type) {
  case "agententer":
    if (agents.includes(event.agent!)) {
      break;
    }
    return [...agents, event.agent!];

  case "agentexit":
    return agents.filter((agent) => agent !== event.agent!);
  }

  return agents;
}

export default function NetworkNodeCard({ network, node }: NetworkNodeCardProps) {
  const handleNetworkNodeEvent = useCallback((event: NetworkNodeEvent) => {
    console.log({ [`${node.name}-heard-that`]: event });
    // eventLogDispatch(event);
  }, [network, node]);

  const handleClickRemove = useCallback(() => {
    network.removeNode(node);
  }, [network, node]);

  const handleClickAddAgent = useCallback(() => {
    console.log(network, node);
    console.log(network.nodes);
    console.log(network.nodes.has(node));
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

  const nodeAgentEvents$ = useMemo(() => {
    return network.events$.pipe(
      filter((event) => {
        console.log({ cmon: event });
        return isAboutAgent(event) && event.node === node;
      })
    );
  }, [network, node]);

  // TODO: this kinda makes me feel like nodes could just have an agents$ observable
  // that lets observers know the current list of agents
  const [agents, agentsDispatch] = useReducer(agentsReducer, [...node.agents]);
  useSubscription(nodeAgentEvents$, agentsDispatch);

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
