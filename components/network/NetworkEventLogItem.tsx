import React from "react";

import { NetworkEvent } from "@/model/network/events";
import { Card, Table } from "@radix-ui/themes";

export type NetworkEventLogItemProps = {
  event: NetworkEvent;
  show: {
    type?: boolean;
    id?: boolean;
    network?: boolean;
    node?: boolean;
    agent?: boolean;
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
    from: showFrom = true,
    to: showTo = true,
  } }: NetworkEventLogItemProps) {
  console.log(showType, showId, showNetwork, showNode, showAgent, showFrom, showTo);
  return (
    <Table.Row>
      {showId && <Table.Cell><span style={{ textWrap: "nowrap" }}>{event.id}</span></Table.Cell>}
      {showType && <Table.Cell><span style={{ textWrap: "nowrap" }}>{event.type}</span></Table.Cell>}
      {showNetwork && <Table.Cell><span style={{ textWrap: "nowrap" }}>{event.network?.name}</span></Table.Cell>}
      {showNode && <Table.Cell><span style={{ textWrap: "nowrap" }}>{event.node?.name}</span></Table.Cell>}
      {showAgent && <Table.Cell><span style={{ textWrap: "nowrap" }}>{event.agent?.name}</span></Table.Cell>}
      {showFrom && <Table.Cell><span style={{ textWrap: "nowrap" }}>{event.edgeSpec?.from?.name}</span></Table.Cell>}
      {showTo && <Table.Cell><span style={{ textWrap: "nowrap" }}>{event.edgeSpec?.to?.name}</span></Table.Cell>}
    </Table.Row>
  );
}


