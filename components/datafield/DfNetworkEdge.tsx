import React, { useCallback, useContext, useMemo, useRef, useState }  from "react";

import { ThreeEvent } from "@react-three/fiber";
import { useSubscription } from "@/hooks";
import { GameContext } from "../game/GameContext";
import { NetworkEdgeView } from "@/model/network/NetworkView";
import { Mesh } from "three";

type EdgeMeshProps = {
  position: readonly [number, number, number]; // TODO: ArrayVector3
  highlighted: boolean;
  onClick: (event: ThreeEvent<MouseEvent>) => void;
}

function EdgeMesh({ position, highlighted, onClick }: EdgeMeshProps) {
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

export type DfNetworkEdgeProps = {
  edgeView: NetworkEdgeView;
}

export default function DfNetworkEdge({ edgeView }: DfNetworkEdgeProps) {
  const gameContext = useContext(GameContext);

  const edgePosition = edgeView.getPositionAnimation();

  // TODO: handle changes in the view model
  const [highlighted, setHighlighted] = useState(false);

  const onClick = useCallback((ev: ThreeEvent<MouseEvent>) => {
    gameContext.selectObject(edgeView.edge);
    ev.stopPropagation();
  }, []);

  return (
    <EdgeMesh
      position={edgePosition.target}
      highlighted={highlighted}
      onClick={onClick}
    />
  );
}

