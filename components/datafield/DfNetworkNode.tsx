import React, { useContext, useRef, useState }  from "react";

import { ThreeEvent } from "@react-three/fiber";
import { useSubscription } from "@/hooks";
import { GameContext } from "../game/GameContext";
import { NetworkNodeView } from "@/model/network/NetworkView";
import { Mesh } from "three";

type NodeMeshProps = {
  position: readonly [number, number, number]; // TODO: ArrayVector3
  highlighted: boolean;
  onClick: (event: ThreeEvent<MouseEvent>) => void;
}

function NodeMesh({ position, highlighted, onClick }: NodeMeshProps) {
  const meshRef = useRef<Mesh>(null!);

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={1}
      onClick={onClick}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial wireframe wireframeLinewidth={5} color={highlighted ? "orange" : "hotpink"} />
    </mesh>
  );
}

export type DfNetworkNodeProps = {
  nodeView: NetworkNodeView;
}

export default function DfNetworkNode({ nodeView }: DfNetworkNodeProps) {
  const gameContext = useContext(GameContext);
  const node = nodeView.node;

  // TODO: handle changes in the view model
  const [highlighted, setHighlighted] = useState(false);
  useSubscription(node.agents$, (agents) => {
    if (agents.length !== 0) {
      setHighlighted(true);
      return;
    }

    setHighlighted(false);
  });

  const nodePosition = nodeView.getPositionAnimation();

  return (
    <NodeMesh
      position={nodePosition.target}
      highlighted={highlighted}
      onClick={(ev) => {
        gameContext.selectObject(node);
        ev.stopPropagation();
      }}
    />
  );
}

