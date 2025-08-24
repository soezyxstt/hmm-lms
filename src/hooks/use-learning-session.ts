import { useCallback, useEffect, useRef, useState } from "react";
import { api } from '~/trpc/react';

const HEARTBEAT_INTERVAL_MS = 15 * 1000; // 15 seconds
const IDLE_TIMEOUT_MS = 60 * 1000 * 2; // 2 minutes

/**
 * A custom hook to track active user time on a specific course page.
 * It sends a "heartbeat" to the backend at regular intervals as long as the
 * user is active on the page.
 *
 * @param courseId The ID of the course the user is currently viewing.
 * @param enabled Whether the tracking should be active.
 */
export function useLearningTracker(courseId: string, enabled = true) {
  const [isTracking, setIsTracking] = useState(false);
  const [isIdle, setIsIdle] = useState(false);

  // useRef is used to hold values that don't need to trigger a re-render.
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // tRPC mutation
  const heartbeatMutation = api.lessonTracker.heartbeat.useMutation({
    onError: (error) => {
      console.error("Heartbeat failed:", error);
      // Stop tracking if there's a persistent error
      setIsTracking(false);
    },
  });

  // Function to send the heartbeat
  const sendHeartbeat = useCallback(() => {
    if (document.hidden || isIdle || !enabled) {
      // Don't send heartbeat if tab is not visible, user is idle, or tracking is disabled
      return;
    }
    console.log(`Sending heartbeat for course: ${courseId}`);
    heartbeatMutation.mutate({ courseId });
  }, [courseId, isIdle, enabled, heartbeatMutation]);

  // Function to reset the idle timer
  const resetIdleTimer = () => {
    setIsIdle(false);
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = setTimeout(() => {
      console.log("User is now idle.");
      setIsIdle(true);
    }, IDLE_TIMEOUT_MS);
  };

  // Main effect to control the tracking lifecycle
  useEffect(() => {
    if (!enabled) {
      // If tracking is disabled, clean up everything
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      setIsTracking(false);
      return;
    }

    // --- Event Handlers ---
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log("Tab is hidden, pausing tracking.");
      } else {
        console.log("Tab is visible, resuming tracking.");
        // When user comes back, send an immediate heartbeat and reset idle timer
        resetIdleTimer();
        sendHeartbeat();
      }
    };

    const handleUserActivity = () => {
      resetIdleTimer();
    };

    // --- Setup ---
    const startTracking = () => {
      if (isTracking) return;

      console.log("Starting learning tracker...");
      setIsTracking(true);

      // Add event listeners
      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("mousemove", handleUserActivity);
      window.addEventListener("keydown", handleUserActivity);
      window.addEventListener("scroll", handleUserActivity);
      window.addEventListener("click", handleUserActivity);

      // Start timers
      resetIdleTimer();
      sendHeartbeat(); // Send one immediately
      intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
    };

    startTracking();

    // --- Cleanup ---
    return () => {
      console.log("Stopping learning tracker...");
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }

      // Remove event listeners
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("scroll", handleUserActivity);
      window.removeEventListener("click", handleUserActivity);

      setIsTracking(false);
    };
  }, [courseId, enabled, isTracking, sendHeartbeat]); // Rerun effect if courseId or enabled status changes

  return { isTracking, isIdle };
}
