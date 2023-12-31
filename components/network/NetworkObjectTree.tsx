import React, { useContext } from "react";

import { Box, Card, Flex } from "@radix-ui/themes";

import { useStateSubscription } from "@/hooks";
import { NetworkContext } from "./NetworkContext";
import { NetworkNode } from "@/model/network";
import NetworkObjectLink from "./NetworkObjectLink";
import { ArrowRightIcon, ChevronDownIcon } from "@radix-ui/react-icons";

export type NetworkNodeTreeProps = {
  node: NetworkNode
};

export function NetworkNodeTree({ node }: NetworkNodeTreeProps) {
  const agents = useStateSubscription(node.agents$, []);
  const edges = useStateSubscription(node.edges$, []);

  // TODO: this layout ain't good
  return (
    <Box>
      <Flex direction="column">
        <Flex align="center" gap="1">
          <ChevronDownIcon />
          <NetworkObjectLink object={node} />
        </Flex>
        <Flex direction="column" pl="2" ml="2" style={{ borderLeft: "1px solid gray" }}>
          {edges.map((edge) => {
            const toOther = edge.from === node;
            const nodeToLink = toOther ? edge.to : edge.from;
            return ( toOther &&
              <Flex key={edge.id} gap="1" align="center">
                <NetworkObjectLink object={edge} />
                <ArrowRightIcon />
                <NetworkObjectLink object={nodeToLink} />
              </Flex>
            );
          })}
          {agents.map((agent) => {
            return (
              <NetworkObjectLink key={agent.id} object={agent} />
            );
          })}
        </Flex>
      </Flex>
    </Box>
  );
}

export default function NetworkObjectTree() {
  const network = useContext(NetworkContext);
  const nodes = useStateSubscription(network.nodes$, []);

  return (
    <Card>
      <Flex direction="column" gap="3" width="max-content" style={{ maxHeight: "10rem" }}>
        {nodes.map((node) => {
          return (
            <NetworkNodeTree key={node.id} node={node} />
          );
        })}
      </Flex>
    </Card>
  );
}

