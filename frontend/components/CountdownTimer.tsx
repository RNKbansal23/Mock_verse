// In file: frontend/components/CountdownTimer.tsx

"use client";

interface CountdownTimerProps {
  secondsRemaining: number;
}

export function CountdownTimer({ secondsRemaining }: CountdownTimerProps) {
  return (
    <div className="flex items-center justify-center w-16 h-16 bg-yellow-500 rounded-full animate-pulse">
      <span className="text-2xl font-bold text-gray-900">
        {secondsRemaining}
      </span>
    </div>
  );
}