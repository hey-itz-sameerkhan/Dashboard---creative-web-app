// frontend/src/context/ConfirmContext.jsx

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import React, { createContext, useCallback, useContext, useState } from "react";

// 1. Context and initial state setup
const ConfirmContext = createContext();

const initialState = {
  open: false,
  title: "Confirm Logout",
  message: "Are you sure you want to log out?",
  confirmText: "Confirm", // Default text for confirm button
  color: "#orange", // Default color for confirm button
};

// 2. Custom Hook for easy consumption
export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    // This message will help debug if the hook is used outside the provider
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  // We return the object containing the confirm function
  return context;
};

// 3. Provider Component
export const ConfirmProvider = ({ children }) => {
  const [confirmationState, setConfirmationState] = useState(initialState);

  // This state holds the resolve function of the Promise
  const [resolve, setResolve] = useState(() => () => {});

  /**
   * The main confirm function that components will call.
   * It accepts a single object of settings.
   * @param {object} settings - { title, message, confirmText, color }
   */
  const confirm = useCallback((settings) => {
    // Returns a Promise that resolves to true (Confirm) or false (Cancel)
    return new Promise((res) => {
      // Merge new settings with defaults
      setConfirmationState((prev) => ({
        ...prev,
        ...settings,
        open: true, // Always open the dialog
      }));
      setResolve(() => res); // Store the resolve function
    });
  }, []);

  // Closes the dialog and resolves the promise with the result
  const handleClose = (result) => {
    setConfirmationState(initialState); // Reset state
    resolve(result); // Resolve the stored promise
  };

  const contextValue = { confirm };

  return (
    <ConfirmContext.Provider value={contextValue}>
      {children}
      {/* The Modal/Dialog UI. Ensure components only render STRING properties. */}
      <Dialog
        open={confirmationState.open}
        onClose={() => handleClose(false)} // Treat closing as cancellation
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        {/* ✅ FIX: We use confirmationState.title (a string) here */}
        <DialogTitle id="confirm-dialog-title">
          {confirmationState.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            {confirmationState.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClose(false)} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={() => handleClose(true)}
            // Use dynamic color and text from state
            color={confirmationState.color || "primary"}
            autoFocus
          >
            {confirmationState.confirmText}
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmContext.Provider>
  );
};
