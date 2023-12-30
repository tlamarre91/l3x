"use client";

import React, { useContext } from "react";

import NetworkMonitor from "./NetworkMonitor";
import { NetworkContext } from "./NetworkContext";

import { Flex } from "@radix-ui/themes";
import NetworkTestControls from "./NetworkTestControls";
import { useFragmentId } from "@/hooks";

export default function NetworkSandbox() {
  const network = useContext(NetworkContext);
  const fragmentId = useFragmentId();

  return (
    <NetworkContext.Provider value={network}>
      <Flex direction="column" p="2" m="2" gap="2" >
        query: {fragmentId}
        <NetworkTestControls />
        <NetworkMonitor />
      </Flex>
    </NetworkContext.Provider>
  );
}
