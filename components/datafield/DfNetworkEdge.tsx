import React, { useCallback, useContext, useRef, useState }  from "react";

import { ThreeEvent } from "@react-three/fiber";
import { GameContext } from "../game/GameContext";
import { NetworkEdgeView } from "@/model/network/NetworkObjectView";
import { Mesh, Vector3 } from "three";

function direction(p1: ArrayVector3, p2: ArrayVector3): ArrayVector3 {
  const [x1, y1, z1] = p1;
  const [x2, y2, z2] = p2;

  const [dx, dy, dz] = [x2 - x1, y2 - y1, z2 - z1];
  const d = new Vector3(dx, dy, dz).normalize();

  console.log(`Direction from ${p1} to ${p2} is ${[d.x, d.y, d.z]}`);

  return [d.x, d.y, d.z];
}

type EdgeMeshProps = {
  position: readonly [number, number, number]; // TODO: ArrayVector3
  highlighted: boolean;
  onClick: (event: ThreeEvent<MouseEvent>) => void;
}

/** TODO: make this a mesh! */
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

