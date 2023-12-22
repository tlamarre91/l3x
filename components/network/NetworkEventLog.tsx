import React, { useEffect, useReducer, useRef } from "react";

import { NetworkEvent } from "@/model/network/events";
import { Box, Card, Flex, Heading, Separator, Table } from "@radix-ui/themes";
import NetworkEventLogItem from "./NetworkEventLogItem";
import { useSubscription } from "@/hooks";
import { Observable } from "rxjs";

export type NetworkEventLogProps = {
  events$: Observable<NetworkEvent>;
  pinned?: Set<NetworkEvent>;
  count?: number;
  show?: {
    type?: boolean;
    id?: boolean;
    network?: boolean;
    node?: boolean;
    agent?: boolean;
    from?: boolean;
    to?: boolean;
  };
};

const DEFAULT_COUNT = 1000; // DEFAULT_COUNT = Infinity

function eventLogReducer(eventLog: NetworkEvent[], event: NetworkEvent) {
  return [...eventLog, event];
}

const DEFAULT_SHOW = {
  type: true,
  id: true,
  network: true,
  node: true,
  agent: true,
  from: true,
  to: true,
};


export default function NetworkEventLog({
  events$,
  count = DEFAULT_COUNT,
  show = {}
}: NetworkEventLogProps) {
  show = { ...DEFAULT_SHOW, ...show };

  const logBox = useRef<HTMLDivElement>(null);
  const [eventLog, eventLogDispatch] = useReducer(eventLogReducer, []);

  useSubscription(events$, eventLogDispatch);

  const eventsToShow = eventLog.slice(-count);

  useEffect(() => {
    const top = logBox.current?.scrollHeight;
    logBox.current?.scroll({ top, behavior: "smooth" });
  });

  return (
    <Card>
      <Flex direction="column" gap="3">
        <Heading size="3">network events</Heading>
        <Separator size="4" />
        <Box ref={logBox} style={{ overflowY: "scroll", height: "24rem", width: "100%" }}>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                { show.id && <Table.ColumnHeaderCell>id</Table.ColumnHeaderCell> }
                { show.type && <Table.ColumnHeaderCell>type</Table.ColumnHeaderCell> }
                { show.network && <Table.ColumnHeaderCell>network</Table.ColumnHeaderCell> }
                { show.node && <Table.ColumnHeaderCell>node</Table.ColumnHeaderCell> }
                { show.agent && <Table.ColumnHeaderCell>agent</Table.ColumnHeaderCell> }
                { show.from && <Table.ColumnHeaderCell>edge.from</Table.ColumnHeaderCell> }
                { show.to && <Table.ColumnHeaderCell>edge.to</Table.ColumnHeaderCell> }
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {eventsToShow.map((event, _i) => (
                <NetworkEventLogItem key={event.id} event={event} show={show}/>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      </Flex>
    </Card>
  );
}

