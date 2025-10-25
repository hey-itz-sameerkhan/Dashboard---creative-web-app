// frontend/src/context/NotificationContext.jsx

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
// API Imports
import {
  addNotification,
  deleteNotification,
  fetchNotifications,
  markAllRead,
  markSingleRead,
} from "../utils/api";
// 💡 FIX 1: useAuth से user और isLoading (जो अब isAuthLoading है) दोनों को इम्पोर्ट करें।
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

// --- Hook for consuming the context --- (Unchanged)
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

// --- Context Provider Component ---
export const NotificationProvider = ({ children }) => {
  // 💡 FIX 2: Destructure 'isLoading' as 'isAuthLoading' for clear naming
  const { user, isLoading: isAuthLoading } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // --- Core Fetch Function --- (Unchanged, as it correctly checks for !user)

  const loadNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetchNotifications(); // Ensure response structure is handled correctly

      const fetchedNotes = response.notifications || response;
      const notesArray = Array.isArray(fetchedNotes) ? fetchedNotes : [];

      setNotifications(notesArray);
      setUnreadCount(notesArray.filter((n) => !n.read).length);
    } catch (error) {
      console.error(
        "Failed to load notifications (Check API connection):",
        error
      );
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [user]); // Load on mount and setup Polling

  useEffect(() => {
    // 💡 CRITICAL FIX: Polling केवल तभी शुरू करें जब user मौजूद हो और AuthContext लोड न हो रहा हो।
    if (!user || isAuthLoading) {
      // अगर user null है या loading चल रही है, तो interval शुरू न करें और बाहर निकल जाएँ।
      return;
    }

    // Initial load only if user is logged in
    loadNotifications(); // Polling setup: Fetch notifications every 30 seconds

    const intervalId = setInterval(loadNotifications, 30000); // Cleanup function: clear interval when the component unmounts OR user logs out

    return () => clearInterval(intervalId);

    // 💡 FIX 3: Dependency array में user और isAuthLoading दोनों शामिल हैं।
  }, [loadNotifications, user, isAuthLoading]); // --- ACTIONS --- (All actions remain unchanged) // 1. Add new notification

  const addAppNotification = useCallback(
    async (type, message, relatedId = null, source = "General") => {
      if (!user) {
        console.warn("Cannot add notification: No user logged in.");
        return null;
      } // ... (rest of the function)
      try {
        const newNote = await addNotification({
          type,
          message,
          relatedId,
          source, // Included 'source' for better categorization
        }); // Optimistic Update: Add new notification to the top of the list

        setNotifications((prev) => [newNote, ...prev]);
        setUnreadCount((prev) => prev + 1);

        return newNote;
      } catch (error) {
        console.error("Failed to add notification:", error);
        return null;
      }
    },
    [user]
  ); // 2. Mark specific notification as read (Unchanged)
  const handleMarkSingleRead = useCallback(async (id) => {
    try {
      await markSingleRead(id);
      setNotifications((prev) => {
        const updated = prev.map((n) =>
          n._id === id ? { ...n, read: true } : n
        );
        const newUnreadCount = updated.filter((n) => !n.read).length;
        setUnreadCount(newUnreadCount);
        return updated;
      });
    } catch (error) {
      console.error("Failed to mark single read:", error);
    }
  }, []); // 3. Mark all notifications as read (Unchanged)

  const handleMarkAllRead = useCallback(async () => {
    try {
      await markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all read:", error);
    }
  }, []);
  /**
   * 4. Delete a single notification (Optimistic update using 'prev' state) (Unchanged)
   */

  const handleDeleteNotification = useCallback(
    async (id) => {
      try {
        let wasUnread = false;

        setNotifications((prev) => {
          const oldNotification = prev.find((n) => n._id === id);
          if (oldNotification && !oldNotification.read) {
            wasUnread = true;
          }

          const updated = prev.filter((n) => n._id !== id);
          return updated;
        });

        if (wasUnread) {
          setUnreadCount((prevUnread) => (prevUnread > 0 ? prevUnread - 1 : 0));
        }

        await deleteNotification(id);
      } catch (error) {
        console.error("Failed to delete notification:", error);
        loadNotifications();
        throw error;
      }
    },
    [loadNotifications]
  );

  const contextValue = {
    notifications,
    unreadCount,
    isLoading,
    addAppNotification,
    handleMarkSingleRead,
    handleMarkAllRead,
    handleDeleteNotification,
    loadNotifications,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
            {children}   {" "}
    </NotificationContext.Provider>
  );
};
