import React, { useCallback, useMemo } from "react";

import { Network, NetworkNode } from "@/model/network";
import { NetworkNodeEvent, isAboutNode } from "@/model/network/events";
import { filter } from "rxjs";

import { useSubscription } from "@/hooks";
import { Agent } from "@/model/agent";

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
    network.removeNode(node);
  }, [network, node]);

  const handleClickAddAgent = useCallback(() => {
    console.log(network, node);
    console.log(network.nodes);
    console.log(network.nodes.has(node));
    const agent = new Agent("added-agent-" + Date.now());
    network.addAgent(agent, node);
  }, [network, node]);

  /** Observable for events about this node */
  const nodeEvents = useMemo(() => {
    return network.events$.pipe(
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
      <button onClick={handleClickAddAgent}>add agent</button>
      <button onClick={handleClickRemove}>delete node</button>
    </div>
  );
}
