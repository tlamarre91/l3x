import React, { useContext, useRef, useState }  from "react";

import { NetworkContext } from "@/components/network/NetworkContext";
import { Canvas, Vector3, useFrame, LineBasicMaterialProps } from "@react-three/fiber";
import { CameraControls, PerspectiveCamera, Sphere } from "@react-three/drei";
import { Mesh } from "three";
import DfNetwork from "./DfNetwork";
import { Box } from "@radix-ui/themes";

export function DfSkybox() {
  const scale = 80;
  
  return (
    <Sphere scale={[scale, scale, scale]}>
      <meshStandardMaterial color="green" wireframe/>
    </Sphere>
  );
}

export function DfEnvironment() {
  return (
    <>
      <DfSkybox />
      <ambientLight intensity={Math.PI / 2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
    </>
  );
}

export default function Datafield() {

  return (
    <div style={{ height: "60rem", width: "60rem" }}>
      <Canvas>
        <CameraControls minPolarAngle={0} maxPolarAngle={Math.PI / 1.6} />
        <PerspectiveCamera makeDefault position={[5, 0, 30]} />
        <DfEnvironment />
        <DfNetwork />
      </Canvas>
    </div>
  );
}

