import React, { useCallback, useContext, useRef, useState }  from "react";

import { ThreeEvent } from "@react-three/fiber";
import { useSubscription } from "@/hooks";
import { GameContext } from "../game/GameContext";
import { NetworkNodeView } from "@/model/network/NetworkObjectView";
import { Color, Mesh } from "three";

type NodeMeshProps = {
  position: readonly [number, number, number]; // TODO: ArrayVector3
  color: Color;
  onClick: (event: ThreeEvent<MouseEvent>) => void;
}

function NodeMesh({ position, color, onClick }: NodeMeshProps) {
  const meshRef = useRef<Mesh>(null!);

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={1}
      onClick={onClick}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial wireframe wireframeLinewidth={5} color={color} />
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

  const onClick = useCallback((ev: ThreeEvent<MouseEvent>) => {
    gameContext.selectObject(node);
    ev.stopPropagation();
  }, []);

  const nodePosition = nodeView.getPositionAnimation();

  return (
    <NodeMesh
      position={nodePosition.target}
      color={highlighted ? new Color(Color.NAMES.purple) : new Color(Color.NAMES.salmon)}
      onClick={onClick}
    />
  );
}

