import React, { useContext }  from "react";

import { useStateSubscription } from "@/hooks";
import DfNetworkNode from "./DfNetworkNode";
import DfAgent from "./DfAgent";
import { GameContext } from "../game/GameContext";
import DfNetworkEdge from "./DfNetworkEdge";

export default function DfNetwork() {
  const networkView = useContext(GameContext).game.networkView!; // TODO: remove non null assert
  const agentViews = useStateSubscription(networkView.agentViews$, () => networkView.getAgentViews());
  const nodeViews = useStateSubscription(networkView.nodeViews$, () => networkView.getNodeViews());
  const edgeViews = useStateSubscription(networkView.edgeViews$, () => networkView.getEdgeViews());

  console.log(`rendering ${agentViews.length} agents`);
  console.log(`rendering ${nodeViews.length} nodes`);
  console.log(`rendering ${edgeViews.length} edges`);

  return (
    <>
      {
        nodeViews.map((nodeView) => {
          return <DfNetworkNode key={nodeView.node.id} nodeView={nodeView} />;
        })
      }
      {
        agentViews.map((agentView) => {
          return <DfAgent key={agentView.agent.id} agentView={agentView} />;
        })
      }
      {
        edgeViews.map((edgeView) => {
          return <DfNetworkEdge key={edgeView.edge.id} edgeView={edgeView} />;
        })
      }
    </>
  );
}


