// frontend/src/context/ColorModeContext.jsx

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// 1. ColorModeContext को परिभाषित करें
export const ColorModeContext = createContext({ toggleColorMode: () => {} });

// --- Theme Palettes ---

// Light theme (Your existing Blue/White Look)
const getLightTheme = () =>
  createTheme({
    palette: {
      mode: "light",
      primary: {
        main: "#1976d2", // Your prominent blue color for Navbar/Sidebar header
      },
      secondary: {
        main: "#9c27b0",
      },
      background: {
        default: "#f4f6f8", // Very light background for pages
        paper: "#ffffff", // White for cards and surfaces
      },
    },
  });

// Dark theme (Matching the deep dark dashboard image you sent)
const getDarkTheme = () =>
  createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: "#394E6A", // Darker primary color for AppBar (Matching deep blue dashboard tone)
      },
      secondary: {
        main: "#CE93D8",
      },
      background: {
        default: "#0A1929", // Deep dark blue background for pages
        paper: "#102A43", // Slightly lighter dark shade for cards/surfaces
      },
      text: {
        primary: "#E0E0E0",
        secondary: "#A0A0A0",
      },
    },
  });

// 2. Context Provider Component
export const ColorModeProvider = ({ children }) => {
  // Local storage से initial mode load करें, default 'light'
  const [mode, setMode] = useState(
    localStorage.getItem("colorMode") || "light"
  );

  // Theme mode को toggle करने का फंक्शन
  const colorMode = useMemo(
    () => ({
      // This is accessed by the button in AppLayout.jsx
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
      // Also provide the current mode via context
      mode: mode,
    }),
    [mode]
  );

  // जब mode बदलता है, तो उसे local storage में सेव करें
  useEffect(() => {
    localStorage.setItem("colorMode", mode);
  }, [mode]);

  // Theme Object को mode के आधार पर मेमोराइज़ करें
  const theme = useMemo(
    () => (mode === "light" ? getLightTheme() : getDarkTheme()),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        {/* CssBaseline MUI के डिफ़ॉल्ट स्टाइल को रीसेट करता है, और थीम बैकग्राउंड को लागू करता है */}
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

// 3. Custom Hook for easy access
export const useColorMode = () => useContext(ColorModeContext);
