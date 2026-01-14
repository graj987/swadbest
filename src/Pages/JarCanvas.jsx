import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Environment } from "@react-three/drei";
import JarModel from "../Components/JarModel";

function JarScene() {
  const jarRef = useRef();

  useFrame(({ mouse }) => {
    if (!jarRef.current) return;

    // Smooth premium rotation
    jarRef.current.rotation.y +=
      (mouse.x * 1.2 - jarRef.current.rotation.y) * 0.08;

    // Subtle Z-axis tilt
    jarRef.current.rotation.z +=
      (mouse.x * 0.15 - jarRef.current.rotation.z) * 0.06;
  });

  return (
    <group ref={jarRef}>
      <JarModel />
    </group>
  );
}

export default function JarCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 40 }}
      dpr={[1, 2]}
      style={{ width: "100%", height: "100%" }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1.4} />
      <directionalLight position={[-5, 2, -5]} intensity={0.6} />

      {/* Environment reflection */}
      <Environment preset="studio" />

      {/* 3D Model */}
      <JarScene />
    </Canvas>
  );
}
