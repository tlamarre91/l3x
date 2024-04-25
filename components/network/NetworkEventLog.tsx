import React, { useContext, useEffect, useReducer, useRef } from "react";

import { NetworkEvent } from "@/model/network/events";
import { Box, Card, Flex, Heading, Table } from "@radix-ui/themes";
import NetworkEventLogItem from "./NetworkEventLogItem";
import { useSubscription } from "@/hooks";
import { GameContext } from "../game/GameContext";

export type NetworkEventLogProps = {
  // events$: Observable<NetworkEvent>;
  pinned?: Set<NetworkEvent>;
  count?: number;
  show?: {
    type?: boolean;
    id?: boolean;
    node?: boolean;
    agent?: boolean;
    edge?: boolean;
    from?: boolean;
    to?: boolean;
  };
};

const DEFAULT_COUNT = 50;

const DEFAULT_SHOW = {
  type: true,
  id: true,
  node: true,
  agent: true,
  edge: true,
  from: true,
  to: true,
};

function eventLogReducer(eventLog: NetworkEvent[], event: NetworkEvent) {
  return [...eventLog, event];
}

export default function NetworkEventLog({
  count = DEFAULT_COUNT,
  show = {}
}: NetworkEventLogProps) {
  show = { ...DEFAULT_SHOW, ...show };

  const network = useContext(GameContext).game.network!; // TODO: remove non null assert
  const [eventLog, eventLogDispatch] = useReducer(eventLogReducer, []);

  useSubscription(network.events$, eventLogDispatch);


  const logBox = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const top = logBox.current?.scrollHeight;
    logBox.current?.scroll({ top, behavior: "smooth" });
  });

  const eventsToShow = eventLog.slice(-count);

  return (
    <Box width="100%">
      <Card>
        <Flex direction="column" gap="3">
          <Heading size="3">events</Heading>
          <Box ref={logBox} style={{ overflowY: "scroll", height: "42rem", width: "100%" }}>
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  { show.id && <Table.ColumnHeaderCell>id</Table.ColumnHeaderCell> }
                  { show.type && <Table.ColumnHeaderCell>type</Table.ColumnHeaderCell> }
                  { show.node && <Table.ColumnHeaderCell>node</Table.ColumnHeaderCell> }
                  { show.agent && <Table.ColumnHeaderCell>agent</Table.ColumnHeaderCell> }
                  { show.edge && <Table.ColumnHeaderCell>edge</Table.ColumnHeaderCell> }
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
    </Box>
  );
}

