import React, { useContext, useState }  from "react";

import { useStateSubscription } from "@/hooks";
import DfNetworkNode from "./DfNetworkNode";
import DfAgent from "./DfAgent";
import { GameContext } from "../game/GameContext";


export default function DfNetwork() {
  const { network } = useContext(GameContext);
  const nodes = useStateSubscription(network.nodes$, []);
  const [agents, setAgents] = useState(network.agents);

  return (
    <>
      {
        nodes.map((node) => {
          return <DfNetworkNode key={node.id} node={node} />;
        })
      }
      {
        agents.map((agent) => {
          return <DfAgent key={agent.id} agent={agent} />;
        })
      }
    </>
  );
}


