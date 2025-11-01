// ✅ frontend/src/components/ThreeScene.jsx (Final Confirmed Version)

import { Box, CircularProgress, useTheme } from "@mui/material";
import { OrbitControls, useAnimations, useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect } from "react";

// ✅ Model path (works in production now)
const MODEL_PATH = "/models/avatar-final.glb";
useGLTF.preload(MODEL_PATH);

function AvatarModel(props) {
  const { scene, animations } = useGLTF(MODEL_PATH);
  const { actions } = useAnimations(animations, scene);

  useEffect(() => {
    const firstAction = actions && Object.values(actions)[0];
    if (firstAction) firstAction.play();
  }, [actions]);

  // ✅ Position + scale fix
  scene.scale.set(1.5, 1.5, 1.5);
  scene.position.set(0, -1.5, 0);

  return <primitive object={scene} {...props} />;
}

function Controls() {
  useFrame(() => {});
  return (
    <OrbitControls
      enableDamping
      dampingFactor={0.05}
      enableZoom={false}
      enablePan={false}
      target={[0, 0, 0]}
      maxPolarAngle={Math.PI / 2}
    />
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <directionalLight position={[-5, 5, 2]} intensity={0.8} />
      <pointLight position={[0, 5, 10]} intensity={1} />
    </>
  );
}

function SceneCleaner() {
  const { gl } = useThree();
  useEffect(() => {
    const handleContextLost = (e) => e.preventDefault();
    const canvas = gl.domElement;
    canvas.addEventListener("webglcontextlost", handleContextLost);
    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost);
    };
  }, [gl]);
  return null;
}

export default function ThreeScene() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        borderRadius: theme.shape.borderRadius,
        backgroundColor: "transparent",
        overflow: "hidden",
      }}
    >
      <Suspense
        fallback={
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <CircularProgress color="primary" />
          </Box>
        }
      >
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          gl={{ preserveDrawingBuffer: true, antialias: true }}
          style={{ width: "100%", height: "100%" }}
        >
          <Lights />
          <AvatarModel />
          <Controls />
          <SceneCleaner />
        </Canvas>
      </Suspense>
    </Box>
  );
}
