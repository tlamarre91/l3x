import React, { useContext, useRef, useState }  from "react";

import { ThreeEvent, Vector3 } from "@react-three/fiber";
import { NetworkNode } from "@/model/network";
import { useSubscription } from "@/hooks";
import { Positioned } from "@/model/types";
import { GameContext } from "../game/GameContext";

function NodeMesh({ position, highlighted, onClick }: {
  position: Vector3,
  highlighted: boolean,
  onClick: (event: ThreeEvent<MouseEvent>) => void
}) {
  const meshRef = useRef<any>();

  return (
    <mesh
      position={position}
      ref={meshRef}
      scale={1}
      onClick={onClick}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial wireframe wireframeLinewidth={5} color={highlighted ? "orange" : "hotpink"} />
    </mesh>
  );
}

export default function DfNetworkNode({ node }: { node: NetworkNode<Positioned> }) {
  const gameContext = useContext(GameContext);

  const [highlighted, setHighlighted] = useState(false);
  useSubscription(node.agents$, (agents) => {
    if (agents.length !== 0) {
      setHighlighted(true);
      return;
    }

    setHighlighted(false);
  });

  return (
    <NodeMesh
      position={node.data.position}
      highlighted={highlighted}
      onClick={(ev) => {
        gameContext.selectObject(node)
        ev.stopPropagation();
      }}
    />
  );
}

