import React, { useContext, useRef, useState }  from "react";

import { NetworkContext } from "@/components/network/NetworkContext";
import { Vector3, useFrame } from "@react-three/fiber";
import { NetworkNode } from "@/model/network";
import { useSubscription } from "@/hooks";

export interface Positioned {
  position: Vector3
}

function NodeBox({ position, highlighted }: {
  position: Vector3,
  highlighted: boolean
}) {
  // This reference will give us direct access to the mesh
  const meshRef = useRef<any>()
  // Set up state for the hovered and active state
  const [active, setActive] = useState(false)

  // Subscribe this component to the render-loop, rotate the mesh every frame
  // useFrame((state, delta) => (meshRef.current!.rotation.x += delta))

  // Return view, these are regular three.js elements expressed in JSX
  return (
    <mesh
      position={position}
      ref={meshRef}
      scale={active ? 1.5 : 1}
      onClick={() => setActive(!active)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial wireframe color={highlighted ? 'orange' : 'hotpink'} />
    </mesh>
  )
}

export default function DfNetworkNode({ node }: { node: NetworkNode<Positioned> }) {
  const network = useContext(NetworkContext);

  const [highlighted, setHighlighted] = useState(false);
  useSubscription(node.agents$, (agents) => {
    if (agents.length !== 0) {
      setHighlighted(true);
      return;
    }

    setHighlighted(false);
  });

  return (
    <NodeBox position={node.data.position} highlighted={highlighted}/>
  );
}

