import React, { useCallback, useContext, useMemo, useRef, useState }  from "react";

import { NetworkContext } from "@/components/network/NetworkContext";
import { Vector3, useFrame } from "@react-three/fiber";
import { NetworkNode } from "@/model/network";
import { Agent } from "@/model/agent";
import { useStateSubscription, useSubscription } from "@/hooks";
import { filter } from "rxjs";
import { Sphere } from "@react-three/drei";

export interface Positioned {
  position: Vector3
}

function AgentMesh({ position, highlighted }: {
  position: Vector3,
  highlighted: boolean
}) {
  const scale = 1.2

  return (
    <Sphere position={position} scale={[scale, scale, scale]}>
      <meshStandardMaterial color={highlighted ? "green" : "gray"} wireframe/>
    </Sphere>
  );
}

export default function DfAgent({ agent }: { agent: Agent }) {
  const network = useContext(NetworkContext);

  const [position, setPosition] = useState(() => {
    const agentNode = network.getAgentLocation(agent);
    if (agentNode == null) {
      console.error("couldn't find agent position", agent);
      throw new Error("couldn't find agent position");
    }

    return agentNode.data.position
  });

  // const [animationStartPosition, setAnimationStartPosition] = useState(position);
  // const [animationEndPosition, setAnimationEndPosition] = useState<Vector3 | null>(null);

  const alive = useStateSubscription(agent.observableExecutionState.alive$, false);

  const agentCrossEvents = useMemo(() => network.agentEvents$.pipe(
    filter(
      (ev) => ev.agent === agent && ev.type === "agentcross" && ev.edge != null
    )
  ), [network, agent]);

  const animateToPosition = useCallback((targetPosition: Vector3) => {
    setPosition(targetPosition) // TODO: ♂️
  }, []);

  useSubscription(agentCrossEvents, (ev) => {
    const data = ev.edge?.to.data as any; // TODO: ♂️
    animateToPosition(data.position);
  });

  return (
    <AgentMesh position={position} highlighted={alive}/>
  );
}


