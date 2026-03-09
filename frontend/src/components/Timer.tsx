import React, { useEffect, useState } from "react";

interface TimerProps {
  expiresAt: string; // ISO date string
  onExpire: () => void;
}

/**
 * Countdown timer that displays remaining time and triggers onExpire callback.
 */
const Timer: React.FC<TimerProps> = ({ expiresAt, onExpire }) => {
  const [remaining, setRemaining] = useState<number>(0);

  useEffect(() => {
    const updateRemaining = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining(0);
        onExpire();
      } else {
        setRemaining(diff);
      }
    };

    // Initial calculation
    updateRemaining();

    // Update every second
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  // Format milliseconds into MM:SS
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const display = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const isUrgent = remaining < 60000; // less than 1 minute

  return (
    <div className={`timer ${isUrgent ? "timer-urgent" : ""}`}>
      <span className="timer-icon">⏱</span>
      <span className="timer-display">{display}</span>
    </div>
  );
};

export default Timer;
