import React, { useCallback, useEffect, useMemo } from "react";

import { Network, NetworkNode } from "@/model/network";
import { NetworkNodeEvent, isAboutNode } from "@/model/network/events";
import { filter } from "rxjs";

import { useSubscription } from "@/hooks";

export type NetworkNodeCardProps = {
  network: Network;
  node: NetworkNode;
  onClick?: () => void;
};

export default function NetworkNodeCard({ network, node }: NetworkNodeCardProps) {
  const handleNetworkEvent = useCallback((event: NetworkNodeEvent) => {
    console.log({ [`${node.name}-heard-that`]: event });
  }, [network, node]);

  const handleClickRemove = useCallback(() => {
    network.removeNode(node)
  }, [network, node]);

  /**
   * Subject reporting events about this node
   */
  const nodeEvents = useMemo(() => {
    return network.eventsSubject.pipe(
      filter(isAboutNode),
      filter((event) => event.node === node)
    );
  }, [network, node]);

  useSubscription(nodeEvents, handleNetworkEvent);


  return (
    <div className="rounded-md border m-1">
      <div className="bold">
        {node.name}
      </div>
      <button onClick={handleClickRemove}>do you dare?</button>
    </div>
  );
}
