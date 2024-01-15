import React, { useContext, useRef, useState }  from "react";

import { NetworkContext } from "@/components/network/NetworkContext";
import { Canvas, Vector3, useFrame } from "@react-three/fiber";
import { Mesh } from "three";
import { useStateSubscription } from "@/hooks";
import DfNetworkNode from "./DfNetworkNode";
import DfAgent from "./DfAgent";


export default function DfNetwork() {
  const network = useContext(NetworkContext);
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


