import React, { useContext, useRef, useState }  from "react";

import { NetworkContext } from "@/components/network/NetworkContext";
import { Canvas, Vector3, useFrame } from "@react-three/fiber";
import { Mesh } from "three";
import { useStateSubscription } from "@/hooks";
import DfNetworkNode from "./DfNetworkNode";


export default function DfNetwork() {
  const network = useContext(NetworkContext);
  const nodes = useStateSubscription(network.nodes$, [])

  return (
    <>
      {
        nodes.map((node) => {
          return <DfNetworkNode node={node} />
        })
      }
    </>
  );
}


