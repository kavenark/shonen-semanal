"use client";

import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  seconds: number;
  onComplete: () => void;
  className?: string;
}

export function CountdownTimer({ seconds, onComplete, className }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="text-8xl font-bold tabular-nums">
        {timeLeft}
      </div>
      <div className="text-2xl text-white mt-2">
        segundos restantes
      </div>
    </div>
  );
}

