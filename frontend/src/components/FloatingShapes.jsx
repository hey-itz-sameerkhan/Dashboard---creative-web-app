import { MeshWobbleMaterial, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React from "react";

export default function FloatingShapes() {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <MeshWobbleMaterial color="#00f0ff" speed={2} factor={0.6} />
      </mesh>
      <OrbitControls enableZoom={false} />
    </Canvas>
  );
}
