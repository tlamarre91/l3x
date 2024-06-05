import { Box, Card, Flex, Heading } from "@radix-ui/themes";
import React from "react";
import { useStateSubscription } from "@/hooks";
import { DiscIcon } from "@radix-ui/react-icons";
import { NetworkNode } from "@/model/network/NetworkNode";

export type NetworkNodeDetailsProps = {
  node: NetworkNode;
};

export default function NetworkNodeDetails({ node }: NetworkNodeDetailsProps) {
  const agents = useStateSubscription(node.agents$, []);
  return (
    <Box>
      <Card>
        <Flex direction="column" gap="3" width="max-content">
          <Heading size="3">
            <DiscIcon /> {node.name}
          </Heading>
          {agents.map((agent) => {
            return (
              <div key={agent.name}>{agent?.name}</div>
            );
          })}
        </Flex>
      </Card>
    </Box>
  );
}
