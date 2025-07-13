// In file: frontend/components/InterviewWindow.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InterviewTurn } from "@/lib/types";
import { InterviewerCharacter } from "./InterviewerCharacter";

// --- THIS IS THE FIX ---
// We define the type for SpeechRecognition here so TypeScript knows what it is.
type SpeechRecognition = any; // We can use 'any' for simplicity, as it's a browser-specific API.
// -----------------------

type InterviewState = "idle" | "listening" | "processing" | "speaking";

export function InterviewWindow({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [transcript, setTranscript] = useState<InterviewTurn[]>([]);
  const [state, setState] = useState<InterviewState>("speaking");
  const [currentAiText, setCurrentAiText] = useState<string>("");

  const ws = useRef<WebSocket | null>(null);
  const recognition = useRef<SpeechRecognition | null>(null); // This line will now work
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const firstQuestion = localStorage.getItem('firstQuestion');
    if (firstQuestion) {
      speak(firstQuestion);
      localStorage.removeItem('firstQuestion');
    }

    const wsUrl = `ws://localhost:8000/ws/interviews/${sessionId}`;
    ws.current = new WebSocket(wsUrl);
    ws.current.onopen = () => console.log("WebSocket connected");
    ws.current.onclose = () => console.log("WebSocket disconnected");
    ws.current.onmessage = (event) => {
      const aiResponse = event.data;
      speak(aiResponse);
    };

    interface IWindow extends Window {
      SpeechRecognition: any;
      webkitSpeechRecognition: any;
    }
    const { SpeechRecognition, webkitSpeechRecognition } = window as unknown as IWindow;
    const SpeechRecognitionAPI = SpeechRecognition || webkitSpeechRecognition;

    if (SpeechRecognitionAPI) {
      recognition.current = new SpeechRecognitionAPI();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;

      recognition.current.onresult = (event: SpeechRecognition) => {
        const userAnswer = event.results[0][0].transcript;
        setTranscript(prev => [...prev, { speaker: 'user', text: userAnswer }]);
        
        if (ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(userAnswer);
        }
        setState("processing");
      };

      recognition.current.onend = () => {
        if (state === "listening") {
            setState("processing");
        }
      };
    } else {
        alert("Your browser does not support Speech Recognition. Please use Google Chrome or Edge.");
    }
    
    return () => { ws.current?.close(); };
  }, [sessionId]); // Note: 'state' was removed from here

  const speak = (text: string) => {
    setState("speaking");
    setTranscript(prev => [...prev, { speaker: 'ai', text: text }]);
    setCurrentAiText(text);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      setState("idle");
      setCurrentAiText("");
    };
    window.speechSynthesis.speak(utterance);
  };
  
  const handleMicClick = () => {
    if (state === "idle" && recognition.current) {
      recognition.current.start();
      setState("listening");
    } else if (state === "listening" && recognition.current) {
      recognition.current.stop();
      setState("processing");
    }
  };

  const handleEndInterview = () => {
    setState("processing");
    ws.current?.close();
    router.push(`/results/${sessionId}`);
  };
  
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

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
    <Card className="w-full max-w-4xl h-[90vh] flex flex-col bg-gray-800 border-gray-700 text-white">
      <div className="flex-shrink-0">
        <InterviewerCharacter
          isSpeaking={state === 'speaking'}
          textToType={currentAiText}
        />
      </div>

      <CardContent className="flex-grow overflow-y-auto p-4 space-y-4 border-t border-gray-700">
        <h3 className="text-lg font-semibold text-center text-gray-400">Interview Transcript</h3>
        {transcript.map((turn, index) => (
          <div key={index} className={`flex ${turn.speaker === 'ai' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-md p-3 rounded-lg ${turn.speaker === 'ai' ? 'bg-blue-800' : 'bg-gray-600'}`}>
              <p>{turn.text}</p>
            </div>
          </div>
        ))}
        <div ref={transcriptEndRef} />
      </CardContent>
      
      <div className="p-4 border-t border-gray-700 flex flex-col items-center gap-4 flex-shrink-0">
        <button
          onClick={handleMicClick}
          disabled={buttonState.disabled}
          className={`w-48 h-16 rounded-lg flex items-center justify-center text-xl font-bold transition-colors ${buttonState.color}`}
        >
          {buttonState.text}
        </button>
        <Button variant="destructive" className="w-48" onClick={handleEndInterview} disabled={state === 'processing'}>
          End Interview & Get Feedback
        </Button>
      </div>
    </Card>
  );
}