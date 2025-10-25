// frontend/src/main.jsx

import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App.jsx";
import "./index.css";

// ★★★ NEW IMPORT: ColorModeProvider ko import karein ★★★
import { ColorModeProvider } from "./context/ColorModeContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* ★★★ NEW: ColorModeProvider se App ko wrap karein ★★★ */}
    <ColorModeProvider>
      <App />
    </ColorModeProvider>
  </React.StrictMode>
);
