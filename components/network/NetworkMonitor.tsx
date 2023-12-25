import React from "react";
import { Network } from "@/model/network";
import NetworkNodeList from "./NetworkNodeList";
import NetworkEventLog from "./NetworkEventLog";
import { Flex } from "@radix-ui/themes";

export type NetworkMonitorProps = {
  // network: Network<any, any>;
};

export default function NetworkMonitor({}: NetworkMonitorProps) {
  return (
    <Flex direction="row" gap="2">
      <NetworkNodeList />
      {/* TODO: it'd be cool if you could click on the name of a node and have
        it "selected" in the window and see details*/}
      <NetworkEventLog show={{ network: false }} />
    </Flex>
  );
}

