// In file: frontend/components/InterviewerCharacter.tsx

"use client";

import Lottie from "lottie-react";
import interviewerAnimation from "@/public/animations/interviewer.json";

interface InterviewerCharacterProps {
  isSpeaking: boolean;
}

export function InterviewerCharacter({ isSpeaking }: InterviewerCharacterProps) {
  return (
    <div className="flex flex-col items-center justify-center pt-4">
      {/* The animated character */}
      <div className="w-48 h-48">
        <Lottie
          animationData={interviewerAnimation}
          loop={isSpeaking}
          autoplay={isSpeaking}
        />
      </div>
    </div>
  );
}