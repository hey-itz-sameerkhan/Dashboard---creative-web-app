// frontend/src/components/ThreeScene.jsx — FINAL STABLE VERSION

import { Box, CircularProgress, Typography, useTheme } from "@mui/material";
import { OrbitControls, useAnimations, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";

// ✅ Correct path (must exist in public/models/)
const MODEL_PATH = "/models/avatar-final.glb";

// Preload safely
useGLTF.preload(MODEL_PATH);

function AvatarModel(props) {
  const [error, setError] = useState(false);

  let scene, animations;

  try {
    const gltf = useGLTF(MODEL_PATH);
    scene = gltf.scene;
    animations = gltf.animations;
  } catch (err) {
    console.error("❌ Model load failed:", err);
    setError(true);
  }

  const { actions } = useAnimations(animations || [], scene);

  useEffect(() => {
    if (actions) {
      const firstAction = Object.values(actions)[0];
      if (firstAction) firstAction.play();
    }
  }, [actions]);

  // ❌ If error → show fallback instead of crash
  if (error || !scene) {
    return null;
  }

  scene.scale.set(1.5, 1.5, 1.5);
  scene.position.set(0, -1.5, 0);

  return <primitive object={scene} {...props} />;
}

function Controls() {
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

export default function ThreeScene() {
  const theme = useTheme();
  const [hasError, setHasError] = useState(false);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        borderRadius: theme.shape.borderRadius,
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
            <CircularProgress />
          </Box>
        }
      >
        {!hasError ? (
          <Canvas
            camera={{ position: [0, 0, 5], fov: 50 }}
            gl={{ antialias: true }}
            onError={() => setHasError(true)}
          >
            <Lights />
            <AvatarModel />
            <Controls />
          </Canvas>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "gray",
            }}
          >
            <Typography>⚠️ 3D Model failed to load</Typography>
          </Box>
        )}
      </Suspense>
    </Box>
  );
}
