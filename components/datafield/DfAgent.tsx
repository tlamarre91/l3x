import React, { useCallback, useContext, useMemo, useRef, useState }  from "react";
import { filter } from "rxjs";
import * as THREE from "three";
import { Vector3, useFrame } from "@react-three/fiber";
import { useSpring, animated } from '@react-spring/three'
import { Sphere, Wireframe } from "@react-three/drei";

import { NetworkContext } from "@/components/network/NetworkContext";
import { NetworkNode } from "@/model/network";
import { Agent } from "@/model/agent";
import { useStateSubscription, useSubscription } from "@/hooks";

export interface Positioned {
  position: [number, number, number];
}

export default function DfAgent({ agent }: { agent: Agent }) {
  const network = useContext(NetworkContext);

  const alive = useStateSubscription(agent.observableExecutionState.alive$, false);

  const agentCrossEvents = useMemo(() => network.agentEvents$.pipe(
    filter(
      (ev) => ev.agent === agent && ev.type === "agentcross" && ev.edge != null
    )
  ), [network, agent]);

  const meshRef = useRef<THREE.Mesh<any>>(null!);

  // const position = useRef((() => {
  //   const agentNode = network.getAgentLocation(agent);
  //   if (agentNode == null) {
  //     console.error("couldn't find agent position", agent);
  //     throw new Error("couldn't find agent position");
  //   }
  //
  //   const [x, y, z] = agentNode.data.position;
  //   return new THREE.Vector3(x, y, z);
  // })());  // TODO: ♂️

  // const [animationStartPosition, setAnimationStartPosition] = useState(position.current);
  // const [animationEndPosition, setAnimationEndPosition] = useState<THREE.Vector3 | null>(null);
  // const animationProgress = useRef(1);
  //
  // const animateToPosition = useCallback(([x, y, z]: [number, number, number]) => {
  //   setAnimationStartPosition(position.current);
  //   setAnimationEndPosition(new THREE.Vector3(x, y, z));
  //   // animationProgress.current = 0;
  //   // setPosition(targetPosition) // TODO: ♂️
  // }, []);
  //
  // useFrame((state, delta) => {
  //   if (animationProgress.current >= 1 || animationEndPosition == null) {
  //     return;
  //   }
  //
  //   const DURATION = 2; // TODO: extract
  //
  //   const newAnimationProgress = Math.min(1, animationProgress.current + (delta / DURATION));
  //   const newPosition = new THREE.Vector3().lerpVectors(animationStartPosition, animationEndPosition, newAnimationProgress);
  //
  //   position.current = newPosition;
  //   meshRef.current.position.copy(newPosition);
  //   animationProgress.current = newAnimationProgress;
  // });

  const initialPosition = useMemo(() => {
    const agentNode = network.getAgentLocation(agent);
    if (agentNode == null) {
      console.error("couldn't find agent position", agent);
      throw new Error("couldn't find agent position");
    }

    const [x, y, z] = agentNode.data.position;
    return new THREE.Vector3(x, y, z);
  }, []);

  const [springs, api] = useSpring(
    () => ({
      scale: 1,
      position: [0, 0],
      color: '#ff6d6d',
      config: key => {
        switch (key) {
          case 'scale':
            return {
              mass: 4,
              friction: 10,
            }
          case 'position':
            return { mass: 4, friction: 220 }
          default:
            return {}
        }
      },
    }),
    []
  )

  useSubscription(agentCrossEvents, (ev) => {
    const data = ev.edge?.to.data as Positioned; // TODO: ♂️
    // api.start({ scale: 100, position: data.position });
    api.start({ position: data.position });
  });

  const meshScale = 1.2;

  const AnimatedSphere = animated(Sphere);

  const sphere = (
    <AnimatedSphere position={springs.position.to((pos) => pos)} scale={springs.scale} ref={meshRef}>
      <meshStandardMaterial opacity={1} color={alive ? "green" : "gray"} />
      <Wireframe />
    </AnimatedSphere>
  )

  return sphere;
}


