import React from "react";
import NetworkObjectTree from "./NetworkObjectTree";
import NetworkEventLog from "./NetworkEventLog";
import { Flex } from "@radix-ui/themes";

export type NetworkMonitorProps = {
  // network: Network<any, any>;
};

export default function NetworkMonitor({}: NetworkMonitorProps) {
  return (
    <Flex direction="row" gap="2">
      {/* <NetworkNodeList /> */}
      <NetworkObjectTree />
      <NetworkEventLog />
    </Flex>
  );
}

