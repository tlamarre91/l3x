import React, { useContext, useEffect, useState }  from "react";

import { useStateSubscription } from "@/hooks";
import DfNetworkNode from "./DfNetworkNode";
import DfAgent from "./DfAgent";
import { GameContext } from "../game/GameContext";
import DfNetworkEdge from "./DfNetworkEdge";
import { GameUiError } from "@/model/errors";

export default function DfNetwork() {
  // const networkView = useContext(GameContext).game.getNetworkView();
  const game = useContext(GameContext).game;
  const networkView = useStateSubscription(game.networkView$, game.getNetworkView());

  // if (networkView == null) {
  //   console.log("No network"); // TODO
  //   return (
  //     <></>
  //   );
  //   // throw new GameUiError("Network view not found");
  // }

  const [agentViews, setAgentViews] = useState(networkView?.getAgentViews() ?? []);
  const [nodeViews, setNodeViews] = useState(networkView?.getNodeViews() ?? []);
  const [edgeViews, setEdgeViews] = useState(networkView?.getEdgeViews() ?? []);

  useEffect(() => {
    if (networkView == null) {
      return;
    }

    const agentSubscription = networkView.agentViews$.subscribe(setAgentViews);
    const nodeSubscription = networkView.nodeViews$.subscribe(setNodeViews);
    const edgeSubscription = networkView.edgeViews$.subscribe(setEdgeViews);

    return () => {
      agentSubscription.unsubscribe();
      nodeSubscription.unsubscribe();
      edgeSubscription.unsubscribe();
    };
  }, [networkView]);

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


