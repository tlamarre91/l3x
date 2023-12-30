import React, { useContext } from "react";


import { Card, Flex, Heading } from "@radix-ui/themes";
import { useStateSubscription } from "@/hooks";
import NetworkNodeCard from "./NetworkNodeCard";
import { NetworkContext } from "./NetworkContext";

export default function NetworkNodeList() {
  const network = useContext(NetworkContext);
  const nodes = useStateSubscription(network.nodes$, []);

  return (
    <Card>
      <Flex direction="column" gap="2" style={{ height: "42rem", overflowY: "scroll" }}>
        <Heading size="3">nodes</Heading>
        {nodes.map((node) => (
          <NetworkNodeCard key={node.id} node={node}/>
        ))}
      </Flex>
    </Card>
  );
}

