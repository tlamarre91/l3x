import React from "react";

import { SequentialNetworkEvent } from "@/model/network/events";
import { Card } from "@radix-ui/themes";

export type NetworkEventLogItemProps = {
  event: SequentialNetworkEvent;
};

const DEFAULT_COUNT = 100;

export default function NetworkEventLogItem({ event }: NetworkEventLogItemProps) {
  return (
    <div>{event.id} {event.type}</div>
  );
}


