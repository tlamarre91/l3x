import React, { useEffect, useRef } from "react";

import { NetworkEvent } from "@/model/network/events";
import { Box, Card, Flex, Heading, Separator } from "@radix-ui/themes";
import NetworkEventLogItem from "./NetworkEventLogItem";

export type NetworkEventLogProps = {
  events: NetworkEvent[];
  pinned?: Set<NetworkEvent>;
  count?: number;
};

const DEFAULT_COUNT = 1000;

export default function NetworkEventLog({ events, count = DEFAULT_COUNT }: NetworkEventLogProps) {
  const logBox = useRef<HTMLDivElement>(null);
  const eventsToShow = events.slice(-count);

  useEffect(() => {
    const top = logBox.current?.scrollHeight;
    logBox.current?.scroll({ top, behavior: "smooth" });
  });

  return (
    <Card>
      <Flex direction="column" gap="3">
        <Heading size="3">network events</Heading>
        <Separator size="4" />
        <Box ref={logBox} style={{ overflow: "scroll", height: "24rem" }}>
          <ul>
            {eventsToShow.map((event, _i) => (
              <li key={event.id}>
                <NetworkEventLogItem event={event} />
              </li>
            ))}
          </ul>
        </Box>
      </Flex>
    </Card>
  );
}

