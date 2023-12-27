"use client";

import React, { useState, useEffect, useContext, useCallback } from "react";

import NetworkMonitor from "./NetworkMonitor";
import { NetworkContext } from "./NetworkContext";

import { Flex } from "@radix-ui/themes";
import { timestamp } from "@/utils";
import NetworkTestControls from "./NetworkTestControls";
import { useEventListener } from "@/hooks";

export type NetworkSandboxProps = {
  query?: string;
}

export default function NetworkSandbox() {
  const network = useContext(NetworkContext);

  const [fragmentId, setFragmentId] = useState<string | null>(null);

  const handleHashChange = () => setFragmentId(window.location.hash);
  useEffect(handleHashChange, []);
  useEventListener("hashchange", handleHashChange, []);

  return (
    <NetworkContext.Provider value={network}>
      <Flex
        direction="column"
        p="2"
        m="2"
        gap="2"
      >
        query: {fragmentId}
        <NetworkTestControls />
        <NetworkMonitor />
      </Flex>
    </NetworkContext.Provider>
  );
}



