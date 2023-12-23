import React from "react";

import { NetworkEvent } from "@/model/network/events";
import { Table } from "@radix-ui/themes";

export type NetworkEventLogItemProps = {
  event: NetworkEvent;
  show: {
    type?: boolean;
    id?: boolean;
    network?: boolean;
    node?: boolean;
    agent?: boolean;
    edge?: boolean;
    from?: boolean;
    to?: boolean;
  };
};

export default function NetworkEventLogItem({
  event,
  show: {
    type: showType = true,
    id: showId = true,
    network: showNetwork = true,
    node: showNode = true,
    agent: showAgent = true,
    edge: showEdge = true,
    from: showFrom = true,
    to: showTo = true,
  } }: NetworkEventLogItemProps) {
  return (
    <Table.Row>
      {showId
        && <Table.Cell><span style={{ textWrap: "nowrap" }}>{event.id}</span></Table.Cell>}
      {showType
        && <Table.Cell><span style={{ textWrap: "nowrap" }}>{event.type}</span></Table.Cell>}
      {showNetwork
        && <Table.Cell><span style={{ textWrap: "nowrap" }}>{event.network?.name}</span></Table.Cell>}
      {showNode
        && <Table.Cell><span style={{ textWrap: "nowrap" }}>{event.node?.name}</span></Table.Cell>}
      {showAgent
        && <Table.Cell><span style={{ textWrap: "nowrap" }}>{event.agent?.name}</span></Table.Cell>}
      {showEdge
        && <Table.Cell><span style={{ textWrap: "nowrap" }}>{event.edge?.name}</span></Table.Cell>}
      {showFrom
        && <Table.Cell><span style={{ textWrap: "nowrap" }}>{event.edge?.from?.name}</span></Table.Cell>}
      {showTo
        && <Table.Cell><span style={{ textWrap: "nowrap" }}>{event.edge?.to?.name}</span></Table.Cell>}
    </Table.Row>
  );
}


