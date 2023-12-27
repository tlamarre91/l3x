import { Box, Card, Flex, Heading } from "@radix-ui/themes";
import React, { useCallback, useMemo, useReducer } from "react";
import Button from "@/components/ui/Button";
import { NetworkNode } from "@/model/network";
import { useStateSubscription } from "@/hooks";

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
            {node.name}
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
