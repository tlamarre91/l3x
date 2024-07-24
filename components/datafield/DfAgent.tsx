import React, { useContext, useRef }  from "react";
import * as THREE from "three";
import { useSpring, animated, easings, to } from "@react-spring/three";

import { GameContext } from "@/components/game/GameContext";
import { useSubscription } from "@/hooks";
import { AgentView } from "@/model/network/NetworkObjectView";

export interface DfAgentProps {
  agentView: AgentView;
}

export default function DfAgent({ agentView }: DfAgentProps) {
  const { selectObject } = useContext(GameContext);

  const meshRef = useRef<THREE.Mesh>(null!);

  const [meshSpring, meshSpringApi] = useSpring(() => {
    const startPos = agentView.getPositionAnimation().target;
    const startRotation = agentView.getRotationAnimation().target;
    const startUp = agentView.getUpAxisAnimation().target;

    console.log("puttin", agentView.agent.name, "at", startPos);
    console.log(startPos);

    return {
      scale: 1.2,
      position: [startPos.x, startPos.y, startPos.z] as const,
      rotation: startRotation,
      upAxis: [startUp.x, startUp.y, startUp.z] as const,
      quotation: "something",
      config: {
        easing: easings.easeInOutQuad
      },
    }
  }, [agentView]);

  // TODO: can i extract binding a spring to a bunch of properties??
  useSubscription(agentView.positionAnimation$, (positionAnimation) => {
    const targetPos = positionAnimation.target;

    meshSpringApi.start({
      from: {
        position: meshSpring.position,
      },
      to: {
        position: [targetPos.x, targetPos.y, targetPos.z],
      },
      config: {
        duration: positionAnimation.duration,
      }
    });
  }, [meshSpring, meshSpringApi]);

  useSubscription(agentView.rotationAnimation$, (rotationAnimation) => {
    meshSpringApi.start({
      from: {
        rotation: meshSpring.rotation,
      },
      to: {
        rotation: rotationAnimation.target,
      },
      config: {
        duration: rotationAnimation.duration,
      },
    });
  }, [meshSpring, meshSpringApi]);

  useSubscription(agentView.upAxisAnimation$, (upAxisAnimation) => {
    const targetUpAxis = upAxisAnimation.target;

    meshSpringApi.start({
      from: {
        upAxis: meshSpring.upAxis,
      },
      to: {
        upAxis: [targetUpAxis.x, targetUpAxis.y, targetUpAxis.z],
      },
      config: {
        duration: upAxisAnimation.duration,
      }
    });
  }, [meshSpring, meshSpringApi]);

  const color = THREE.Color.NAMES.lime;

  const quaternion = to(
    [meshSpring.rotation, meshSpring.upAxis] as const,
    (rotation, upAxis) => {
      console.log("interpin", rotation, upAxis);
      const quaternion = new THREE.Quaternion();
      const upAxisVec = new THREE.Vector3(...upAxis).normalize();
      quaternion.setFromAxisAngle(upAxisVec, rotation);
      return quaternion
    }
  );

  // TODO: why type check error??
  const animatedSphere = (
    <animated.mesh
      position={meshSpring.position}
      scale={meshSpring.scale}
      quaternion={quaternion}
      ref={meshRef}
      onClick={(ev) => {
        selectObject(agentView.agent);
        ev.stopPropagation();
      }}
    >
      <sphereGeometry args={[1, 8, 6]} />
      <meshStandardMaterial wireframe wireframeLinewidth={5} color={color} />
    </animated.mesh>
  );

  return animatedSphere;
}


