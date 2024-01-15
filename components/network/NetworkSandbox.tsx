"use client";

import React, { useContext } from "react";

import NetworkMonitor from "./NetworkMonitor";
import { NetworkContext } from "./NetworkContext";

import { Flex } from "@radix-ui/themes";
import NetworkTestControls from "./NetworkTestControls";
import Datafield from "../datafield/Datafield";

export default function NetworkSandbox() {
  const network = useContext(NetworkContext);

  return (
    <NetworkContext.Provider value={network}>
      <Flex direction="column" p="2" m="2" gap="2" >
        <NetworkTestControls />
        <Datafield />
        <NetworkMonitor />
      </Flex>
    </NetworkContext.Provider>
  );
}
