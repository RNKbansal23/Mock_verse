// In file: frontend/components/InterviewerCharacter.tsx

"use client";

import Lottie from "lottie-react";
import { TypeAnimation } from "react-type-animation";
import interviewerAnimation from "@/public/animations/interviewer.json"; // Adjust path if needed

interface InterviewerCharacterProps {
  isSpeaking: boolean;
  textToType: string;
}

export function InterviewerCharacter({ isSpeaking, textToType }: InterviewerCharacterProps) {
  return (
    <div className="flex flex-col items-center justify-center p-4 w-full">
      {/* The animated character */}
      <div className="w-48 h-48 md:w-64 md:h-64">
        <Lottie
          animationData={interviewerAnimation}
          loop={isSpeaking} // The animation only loops when the AI is speaking
          autoplay={isSpeaking}
        />
      </div>

      {/* The text box with the typewriter effect */}
      <div className="w-full max-w-2xl min-h-[120px] p-4 mt-4 bg-gray-900 border border-gray-700 rounded-lg shadow-lg">
        {textToType && (
          <TypeAnimation
            key={textToType} // Using key to force re-render on new text
            sequence={[textToType]}
            wrapper="p"
            speed={60} // Adjust typing speed here (lower is faster)
            style={{ fontSize: '1.1em', display: 'inline-block', color: '#E5E7EB' }}
            cursor={false} // Hides the blinking cursor at the end
          />
        )}
      </div>
    </div>
  );
}