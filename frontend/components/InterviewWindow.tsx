// In file: frontend/components/InterviewWindow.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { InterviewTurn } from "@/lib/types";

// A type for the different states our component can be in
type InterviewState = "idle" | "listening" | "processing" | "speaking";

export function InterviewWindow({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [transcript, setTranscript] = useState<InterviewTurn[]>([]);
  const [state, setState] = useState<InterviewState>("speaking"); // Start with AI speaking

  const ws = useRef<WebSocket | null>(null);
  const recognition = useRef<SpeechRecognition | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // --- Main WebSocket and Voice Logic ---
  useEffect(() => {
    // 1. Get the first question from local storage
    const firstQuestion = localStorage.getItem('firstQuestion');
    if (firstQuestion) {
      setTranscript([{ speaker: 'ai', text: firstQuestion }]);
      speak(firstQuestion); // Speak the first question
      localStorage.removeItem('firstQuestion');
    }

    // 2. Initialize WebSocket Connection
    const wsUrl = `ws://localhost:8000/ws/interviews/${sessionId}`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => console.log("WebSocket connected");
    ws.current.onclose = () => console.log("WebSocket disconnected");

    ws.current.onmessage = (event) => {
      const aiResponse = event.data;
      setTranscript(prev => [...prev, { speaker: 'ai', text: aiResponse }]);
      speak(aiResponse); // Speak the AI's response
    };

    // 3. Initialize Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false; // Stop after a pause
      recognition.current.interimResults = false;

      recognition.current.onresult = (event) => {
        const userAnswer = event.results[0][0].transcript;
        setTranscript(prev => [...prev, { speaker: 'user', text: userAnswer }]);
        
        // Send user's answer over the WebSocket
        if (ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(userAnswer);
        }
        setState("processing"); // We are now waiting for the AI
      };

      recognition.current.onend = () => {
        if(state === "listening") setState("processing");
      };
    } else {
        alert("Your browser does not support Speech Recognition. Please use Google Chrome or Edge.");
    }
    
    // Cleanup on component unmount
    return () => {
      ws.current?.close();
    };
  }, [sessionId]);

  // --- Helper Functions ---
  const speak = (text: string) => {
    setState("speaking");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setState("idle"); // Ready for user to speak
    window.speechSynthesis.speak(utterance);
  };
  
  const handleMicClick = () => {
    if (state === "idle") {
      recognition.current?.start();
      setState("listening");
    } else if (state === "listening") {
      recognition.current?.stop();
      setState("processing");
    }
  };
  
  // Scroll to the latest message
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // --- UI Rendering ---
  const getButtonState = () => {
    switch (state) {
      case "idle": return { text: "Speak", color: "bg-green-500", disabled: false };
      case "listening": return { text: "Listening...", color: "bg-red-500", disabled: false };
      case "processing": return { text: "Processing...", color: "bg-yellow-500", disabled: true };
      case "speaking": return { text: "AI Speaking...", color: "bg-blue-500", disabled: true };
      default: return { text: "Speak", color: "bg-green-500", disabled: true };
    }
  };

  const buttonState = getButtonState();

  return (
    <Card className="w-full max-w-2xl h-[80vh] flex flex-col bg-gray-800 border-gray-700 text-white">
      <CardHeader className="text-center">
        <h2 className="text-2xl font-bold">Interview in Progress</h2>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
        {transcript.map((turn, index) => (
          <div key={index} className={`flex ${turn.speaker === 'ai' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-md p-3 rounded-lg ${turn.speaker === 'ai' ? 'bg-blue-600' : 'bg-gray-600'}`}>
              <p>{turn.text}</p>
            </div>
          </div>
        ))}
        <div ref={transcriptEndRef} />
      </CardContent>
      <div className="p-4 border-t border-gray-700 flex justify-center">
        <button
          onClick={handleMicClick}
          disabled={buttonState.disabled}
          className={`w-48 h-16 rounded-lg flex items-center justify-center text-xl font-bold transition-colors ${buttonState.color}`}
        >
          {buttonState.text}
        </button>
      </div>
    </Card>
  );
}