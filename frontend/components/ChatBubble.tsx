// In file: frontend/components/ChatBubble.tsx

"use client";

interface ChatBubbleProps {
  speaker: "ai" | "user";
  message: string;
}

export function ChatBubble({ speaker, message }: ChatBubbleProps) {
  const bubbleAlignment = speaker === "ai" ? "justify-start" : "justify-end";
  const bubbleColor = speaker === "ai" ? "bg-blue-800" : "bg-gray-600";

  return (
    <div className={`flex ${bubbleAlignment}`}>
      <div className={`max-w-xl p-3 rounded-lg ${bubbleColor}`}>
        <p>{message}</p>
      </div>
    </div>
  );
}