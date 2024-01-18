import React, { useContext } from "react";

import { Box, Card, Flex, Heading } from "@radix-ui/themes";

import { useStateSubscription } from "@/hooks";
import Button from "@/components/ui/Button";
import { NetworkNode } from "@/model/network";
import { Agent } from "@/model/agent";
import { DiscIcon } from "@radix-ui/react-icons";
import { GameContext } from "../game/GameContext";

export type NetworkNodeCardProps = {
  node: NetworkNode;
  onClick?: () => void;
};

export default function NetworkNodeCard({ node }: NetworkNodeCardProps) {
  const { network } = useContext(GameContext);
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
        <Flex align="center" gap="3">
          <DiscIcon />
          <Box>
            <a href={`#node:${node.name}`}>
              {node.name}
            </a>
          </Box>
        </Flex>
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
