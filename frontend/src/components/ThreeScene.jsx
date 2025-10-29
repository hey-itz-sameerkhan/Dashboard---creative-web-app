// frontend/src/components/ThreeScene.jsx - FINAL FIX FOR VERCEL CACHE

import { Box, CircularProgress, useTheme } from "@mui/material";
import { OrbitControls, useAnimations, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect } from "react";

// 💡 VERCEL CACHE FIX: एक Cache-Buster Query Parameter जोड़ें।
// यह Vercel को मजबूर करता है कि वह पुराने, खराब (corrupted) कैश को अनदेखा करे।
const CACHE_BUST = "?v=20251029";

// Preload the model to prevent flashes
useGLTF.preload("/models/avatar-final.glb" + CACHE_BUST); // 👈 FIX APPLIED HERE

// 💡 3D Avatar Component
function AvatarModel(props) {
  // useGLTF अब नया, Cache-Busted पाथ इस्तेमाल कर रहा है
  const { scene, animations } = useGLTF(
    "/models/avatar-final.glb" + CACHE_BUST
  ); // 👈 FIX APPLIED HERE

  const { actions, mixer } = useAnimations(animations, scene); // CRITICAL FIX: Ensure animation starts when component mounts
  useEffect(() => {
    if (actions) {
      // We assume the first animation clip is the default action
      const firstAction = Object.values(actions)[0];
      if (firstAction) {
        firstAction.play();
      }
    }
  }, [actions, mixer]); // Adjust scale and position to fit nicely in the view

  scene.scale.set(1.5, 1.5, 1.5); // Slightly larger scale for better visibility
  scene.position.set(0, -1.5, 0);

  return <primitive object={scene} {...props} />;
}

// 💡 Custom Controls Component (Rotation Fix)
function Controls() {
  // This ensures that the component re-renders when needed for controls logic
  useFrame(() => {});
  return (
    <OrbitControls
      enableDamping
      dampingFactor={0.1}
      enableZoom={false} // Disable zooming
      enablePan={false} // Disable panning
      target={[0, 0, 0]}
      maxPolarAngle={Math.PI / 2}
    />
  );
}

// 💡 Main 3D Scene Component - Height and Background FIX Applied
export default function ThreeScene() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        borderRadius: theme.shape.borderRadius, // The Box container itself is transparent, allowing the MUI Paper background to show through.
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
          style={{ width: "100%", height: "100%" }} // ✅ CRITICAL FIX: Set alpha to true for a transparent background
          gl={{ alpha: true }} // Optional: Improves quality and consistency
          flat
          dpr={[1, 2]}
        >
                   {" "}
          {/* We are only using lights here, no explicit background color added to the scene */}
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
