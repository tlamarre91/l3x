import React, { useCallback, useContext, useRef, useState }  from "react";

import { ArrowHelperProps, ThreeEvent } from "@react-three/fiber";
import { GameContext } from "../game/GameContext";
import { NetworkEdgeView } from "@/model/network/NetworkObjectView";
import { ArrowHelper, Mesh, Vector3 } from "three";
import { ArrayVector3 } from "@/model/types";

function direction(p1: ArrayVector3, p2: ArrayVector3): ArrayVector3 {
  const [x1, y1, z1] = p1;
  const [x2, y2, z2] = p2;

  const [dx, dy, dz] = [x2 - x1 + Math.random(), y2 - y1 + Math.random(), z2 - z1 + Math.random()];
  const d = new Vector3(dx, dy, dz).normalize();

  // console.log(`Direction from ${p1} to ${p2} is ${[d.x, d.y, d.z]}`);

  return [d.x, d.y, d.z];
}

type EdgeMeshProps = {
  readonly origin: ArrayVector3;
  readonly direction: ArrayVector3;
  readonly highlighted: boolean;
  readonly onClick: (event: ThreeEvent<MouseEvent>) => void;
  readonly length?: number;
}

/** TODO: make this a mesh! */
function EdgeMesh(props: EdgeMeshProps) {
  const {
    origin,
    direction,
    highlighted,
    onClick,
    length = 3
  } = props;
  const meshRef = useRef<Mesh>(null!);

  const originOffset = [direction[0] * 0.1, direction[1] * 0.1, direction[2] * 0.1];

  const arrowHelperCmpt = (
    <arrowHelper
      args={[
        new Vector3(...direction),
        new Vector3(...originOffset),
        length,
        0xff0000
      ]} />
  );

  return (
    <mesh
      ref={meshRef}
      position={origin}
      scale={1}
      onClick={onClick}
    >
      {arrowHelperCmpt}
      <meshStandardMaterial wireframe wireframeLinewidth={5} color={highlighted ? "orange" : "hotpink"} />
    </mesh>
  );
}

export type DfNetworkEdgeProps = {
  edgeView: NetworkEdgeView;
}

export default function DfNetworkEdge({ edgeView }: DfNetworkEdgeProps) {
  const gameContext = useContext(GameContext);

  const edgePosition = edgeView.getPositionAnimation().target;
  // const edgePosition = [0, 0, 0] as const;
  const edgeDirection = direction(
    edgeView.fromNodeView.getPositionAnimation().target,
    edgeView.toNodeView.getPositionAnimation().target,
  );

  // TODO: handle changes in the view model
  const [highlighted, setHighlighted] = useState(false);

  const onClick = useCallback((ev: ThreeEvent<MouseEvent>) => {
    gameContext.selectObject(edgeView.edge);
    ev.stopPropagation();
  }, []);

  return (
    <EdgeMesh
      origin={edgePosition}
      direction={edgeDirection}
      highlighted={highlighted}
      onClick={onClick}
    />
  );
}

