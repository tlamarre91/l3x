import React from "react";

import { SequentialNetworkEvent } from "@/model/network/events";

export type NetworkEventLogProps = {
  events: SequentialNetworkEvent[];
  pinned?: Set<SequentialNetworkEvent>;
  count?: number;
};

const DEFAULT_COUNT = 100;

export default function NetworkEventLog({ events, count = DEFAULT_COUNT }: NetworkEventLogProps) {
  const eventsToShow = events.slice(-count);
  return (
    <div className="rounded-md border m-1 h-96 overflow-scroll">
      {eventsToShow.map((event, _i) => <div key={event.id}>{event.type} {event.id}</div>)}
    </div>
  );
}

