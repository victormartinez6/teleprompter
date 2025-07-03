import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  seconds: number;
  onComplete: () => void;
  onCancel: () => void;
}

export function CountdownTimer({ seconds, onComplete, onCancel }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, onComplete]);

  const progress = ((seconds - timeLeft) / seconds) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative w-32 h-32 mb-8">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="4"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="#F1613D"
              strokeWidth="4"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl font-bold text-white">{timeLeft}</span>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}