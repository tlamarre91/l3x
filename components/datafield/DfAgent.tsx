import React, { useCallback, useContext, useMemo, useRef, useState }  from "react";
import { filter } from "rxjs";
import * as THREE from "three";
import { Vector3, useFrame } from "@react-three/fiber";
import { useSpring, animated, easings } from '@react-spring/three'
import { Sphere, Wireframe } from "@react-three/drei";

import { GameContext } from "@/components/game/GameContext";
import { NetworkNode } from "@/model/network";
import { Agent } from "@/model/agent";
import { useStateSubscription, useSubscription } from "@/hooks";
import { Positioned } from "@/model/types";

export default function DfAgent({ agent }: { agent: Agent }) {
  const { network, selectObject } = useContext(GameContext);

  const alive = useStateSubscription(agent.observableExecutionState.alive$, false);

  const agentCrossEvents$ = useMemo(() => network.getAgentEvents(agent).pipe(
    filter(
      (ev) => ev.agent === agent && ev.type === "agentcross" && ev.edge != null
    )
  ), [network, agent]);

  const meshRef = useRef<THREE.Mesh<any>>(null!);

  const initialPosition = useMemo(() => {
    const agentNode = network.getAgentNode(agent);
    if (agentNode == null) {
      console.error("couldn't find agent position", agent);
      // return [0, 0, 0]; // TODO
      throw new Error("couldn't find agent position");
    }

    console.log("found", agent, agentNode.data.position);
    return agentNode.data.position;
  }, [network, agent]);

  const meshScale = 1.2;

  const [meshSprings, api] = useSpring(() => ({
    scale: meshScale,
    position: initialPosition,
    color: '#ff6d6d',
    config: (_key) => {
      return {
        // precision: 0.0001,
        clamp: true,
        easing: easings.easeInOutQuart,
        duration: 200
      };
    }
  }), [initialPosition]);

  useSubscription(agentCrossEvents$, (ev) => {
    const data = ev.edge?.to.data as Positioned; // TODO: ♂️
    console.log("goin");

    api.start({
      from: {
        position: meshSprings.position
      },
      to: {
        position: data.position
      },
    });
  });

  const AnimatedSphere = animated(Sphere);

  const sphere = (
    <AnimatedSphere
      position={meshSprings.position}
      scale={meshSprings.scale}
      ref={meshRef}
      onClick={(ev) => {
        selectObject(agent)
        ev.stopPropagation();
      }}
    >
      <meshStandardMaterial opacity={1} color={alive ? "green" : "gray"} />
      <Wireframe />
    </AnimatedSphere>
  )

  return sphere;
}


