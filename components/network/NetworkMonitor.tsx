import React from "react";
import NetworkObjectTree from "./NetworkObjectTree";
import NetworkEventLog from "./NetworkEventLog";
import { Box, Flex } from "@radix-ui/themes";
import NetworkNodeList from "./NetworkNodeList";

export default function NetworkMonitor() {
  return (
    <Flex direction="row" gap="2">
      <NetworkObjectTree />
      <Box width="100%">
        <Flex direction="column">
          <NetworkEventLog />
          <NetworkNodeList />
        </Flex>
      </Box>
    </Flex>
  );
}

