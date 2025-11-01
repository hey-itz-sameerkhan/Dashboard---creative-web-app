// ✅ frontend/src/components/ThreeScene.jsx (Final Fixed Version for Vercel Assets)

import { Box, CircularProgress, useTheme } from "@mui/material";
import { OrbitControls, useAnimations, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect } from "react";

// ⚠️ FIX: Vercel पर 404 Error को हल करने के लिए Root-Relative पाथ का उपयोग करें
// यह 'public/models/avatar-final.glb' को ठीक से ढूंढेगा।
const MODEL_PATH = "/models/avatar-final.glb";

// ✅ Preload model
useGLTF.preload(MODEL_PATH);

// 💡 Avatar Component
function AvatarModel(props) {
  const { scene, animations } = useGLTF(MODEL_PATH);
  const { actions, mixer } = useAnimations(animations, scene);

  useEffect(() => {
    if (actions) {
      const firstAction = Object.values(actions)[0];
      if (firstAction) {
        firstAction.play();
      }
    }
  }, [actions, mixer]); // ✅ Apply positioning

  scene.scale.set(1.5, 1.5, 1.5);
  scene.position.set(0, -1.5, 0);

  return <primitive object={scene} {...props} />;
}

// 💡 Orbit Controls
function Controls() {
  useFrame(() => {});
  return (
    <OrbitControls
      enableDamping
      dampingFactor={0.1}
      enableZoom={false}
      enablePan={false}
      target={[0, 0, 0]}
      maxPolarAngle={Math.PI / 2}
    />
  );
}

// 💡 Main 3D Scene Component
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
        boxShadow: "none",
      }}
    >
           {" "}
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
                        <CircularProgress color="primary" />         {" "}
          </Box>
        }
      >
               {" "}
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          style={{ width: "100%", height: "100%" }}
          gl={{ alpha: true }}
          flat
          dpr={[1, 2]}
        >
                    <ambientLight intensity={0.8} />
                    <pointLight position={[10, 10, 10]} intensity={1.5} />
                    <directionalLight position={[-5, 5, 5]} intensity={1} />
                    <AvatarModel />
                    <Controls />       {" "}
        </Canvas>
             {" "}
      </Suspense>
         {" "}
    </Box>
  );
}
