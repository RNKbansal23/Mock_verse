// In file: frontend/components/ChatBubble.tsx

"use client";

import { TypeAnimation } from "react-type-animation";

interface ChatBubbleProps {
  speaker: "ai" | "user";
  message: string;
  isTyping?: boolean; // Optional prop to trigger the typewriter
}

export function ChatBubble({ speaker, message, isTyping = false }: ChatBubbleProps) {
  const bubbleAlignment = speaker === "ai" ? "justify-start" : "justify-end";
  const bubbleColor = speaker === "ai" ? "bg-blue-800" : "bg-gray-600";

  return (
    <div className={`flex ${bubbleAlignment}`}>
      <div className={`max-w-xl p-3 rounded-lg ${bubbleColor}`}>
        {isTyping ? (
          <TypeAnimation
            key={message}
            sequence={[message]}
            wrapper="p"
            speed={65} // A slightly more natural speed
            style={{ display: 'inline-block' }}
            cursor={true}
          />
        ) : (
          <p>{message}</p>
        )}
      </div>
    </div>
  );
}