import React, { useContext } from "react";

import { NetworkNode } from "@/model/network";

import { useStateSubscription } from "@/hooks";
import { Agent } from "@/model/agent";
import { Card, Flex, Heading } from "@radix-ui/themes";
import Button from "@/components/ui/Button";
import { NetworkContext } from "./NetworkContext";

export type NetworkNodeCardProps = {
  node: NetworkNode;
  onClick?: () => void;
};

export default function NetworkNodeCard({ node }: NetworkNodeCardProps) {
  const network = useContext(NetworkContext);
  const agents = useStateSubscription(node.agents$, []);
  const edges = useStateSubscription(node.edges$, []);

  const handleClickRemove = () => {
    network.removeNode(node);
  };

  const handleClickAddAgent = () => {
    const agent = new Agent("node-agent-" + Date.now());
    network.addAgent(agent, node);
  };

  const handleClickClearAgents = () => {
    agents.forEach((agent) => network.removeAgent(agent));
  };

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
