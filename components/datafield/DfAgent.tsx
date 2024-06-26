import React, { useContext, useRef }  from "react";
import * as THREE from "three";
import { config, useSpring, animated } from "@react-spring/three";
import { Sphere, Wireframe } from "@react-three/drei";

import { GameContext } from "@/components/game/GameContext";
import { useSubscription } from "@/hooks";
import { AgentView } from "@/model/network/NetworkObjectView";

export interface DfAgentProps {
  agentView: AgentView;
}

export default function DfAgent({ agentView }: DfAgentProps) {
  const { selectObject } = useContext(GameContext);

  const meshRef = useRef<THREE.Mesh>(null!);

  const [meshSpring, meshSpringApi] = useSpring(() => ({
    scale: 1.2,
    position: agentView.getPositionAnimation().target,
    // TODO: duration control
    config: config.slow
  }), [agentView]);

  useSubscription(agentView.positionAnimation$, (positionAnimation) => {
    meshSpringApi.start({
      from: {
        position: meshSpring.position,
      },
      to: {
        position: positionAnimation.target
      },
    });
  }, [meshSpring, meshSpringApi]);

  const AnimatedSphere = animated(Sphere);

  const animatedSphere = (
    <AnimatedSphere
      position={meshSpring.position}
      scale={meshSpring.scale}
      ref={meshRef}
      onClick={(ev) => {
        selectObject(agentView.agent);
        ev.stopPropagation();
      }}
    >
      <meshStandardMaterial opacity={1} color="white" />
      <Wireframe />
    </AnimatedSphere>
  );

  return animatedSphere;
}


