"use client";

import React, { useCallback, useState, useMemo, useEffect, useContext } from "react";
import { Network, NetworkNode } from "@/model/network";
import { Agent } from "@/model/agent";
import { AgentCommand } from "@/model/agent/commands";

import NetworkMonitor from "./NetworkMonitor";
import { NetworkContext } from "./NetworkContext";

import Button from "@/components/ui/Button";
import { Card, Flex } from "@radix-ui/themes";
import { useStateSubscription } from "@/hooks";
import { timestamp } from "@/utils";
import NetworkTestControls from "./NetworkTestControls";

export type NetworkSandboxProps = {
  query?: string;
}

export default function NetworkSandbox() {
  const [fragmentId, setFragmentId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handle = () => setFragmentId(window.location.hash);

    addEventListener("hashchange", handle);
    handle();

    return () => {
      removeEventListener("hashchange", handle);
    };
  }, []);

  const network = useContext(NetworkContext);

  console.log("sandbox render " + timestamp());

  const monitorView = (
    <NetworkMonitor />
  );

  const nodeView = useMemo(() => {
    if (fragmentId == null) {
      return null;
    }

    const [keyType, key] = fragmentId.split(":");
    if (keyType !== "#node") {
      return null;
    }

    return key;
  }, [fragmentId]);

  return (
    <NetworkContext.Provider value={network}>
      <Flex direction="column" p="2" m="2" gap="2">
        query: {fragmentId}
        <NetworkTestControls />
        {nodeView || monitorView}
      </Flex>
    </NetworkContext.Provider>
  );
}



