import React, { useContext }  from "react";

import { useStateSubscription } from "@/hooks";
import DfNetworkNode from "./DfNetworkNode";
import DfAgent from "./DfAgent";
import { GameContext } from "../game/GameContext";

export default function DfNetwork() {
  const networkView = useContext(GameContext).game.networkView!; // TODO: remove non null assert
  const agentViews = useStateSubscription(networkView.agentViews$, () => networkView.getAgentViews());
  const nodeViews = useStateSubscription(networkView.nodeViews$, () => networkView.getNodeViews());

  console.log(`rendering ${agentViews.length} agents`);
  console.log(`rendering ${nodeViews.length} nodes`);

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
    </>
  );
}


