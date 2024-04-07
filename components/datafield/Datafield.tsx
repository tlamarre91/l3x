import React, { CSSProperties }  from "react";

import { Canvas } from "@react-three/fiber";
import { CameraControls, PerspectiveCamera, Sphere } from "@react-three/drei";
import DfNetwork from "./DfNetwork";

export function DfCamera() {
  return (
    <>
      <CameraControls minPolarAngle={0} maxPolarAngle={Math.PI / 1.6} />
      <PerspectiveCamera makeDefault position={[5, 0, 30]} />
    </>
  );
}

export function DfSkybox() {
  const scale = 800;
  
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
  const style = {
    position: "absolute",
    top: "0px",
    left: "0px",
    height: "100vh",
    width: "100vw",
  } satisfies CSSProperties;

  return (
    <div style={style}>
      <Canvas>
        <DfCamera />
        <DfEnvironment />
        <DfNetwork />
      </Canvas>
    </div>
  );
}

