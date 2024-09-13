import React, { PropsWithChildren, useContext, useEffect, useState } from "react";
import { BoxProps } from "@/components/types";
import Panel from "../ui/Panel";
import { GameContext } from "./GameContext";
import { useStateSubscription, useSubscription } from "@/hooks";
import AgentCard from "../agent/AgentCard";
import Flex from "../ui/Flex";

export interface AgentStatePanelProps {
  borderColor?: string;
}


/**
 * Container for agent cards
 */
export function AgentStatePanel(props: AgentStatePanelProps) {
  const {
    game,
    selectObject,
    selectedObject$,
    getSelectedObject
  }= useContext(GameContext);

  const [network, setNetwork] = useState(game.getNetworkView()?.network);
  const [agents, setAgents] = useState(network != null ? network.getAgents() : []);

  useSubscription(game.networkView$, (networkView) => {
    setNetwork(networkView?.network);
  });

  useEffect(() => {
    if (network == null) {
      return;
    }

    const agentsSubscription = network.agents$.subscribe((networkAgents) => {
      console.log("i would like to show the AgentStatePanel for", agents.length, "agents please", "btw network is", network, "typeof window is", typeof window);
      setAgents(networkAgents);
    });


    return agentsSubscription.unsubscribe;
  }, [network]);

  // const network = game.getNetworkView().network;
  // const agents = useStateSubscription(network.agents$, network.getAgents());

  return (
    <Panel m="0" r="0" style={{ borderLeft: "0px", borderRight: "0px" }}>
      <Flex flexDirection="column" width="100%">
        {
          agents.map((agent) => <AgentCard key={agent.id} agent={agent} />)
        }
      </Flex>
    </Panel>
  );
}
