// In file: frontend/components/InterviewWindow.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InterviewTurn } from "@/lib/types";
import { InterviewerCharacter } from "./InterviewerCharacter";
import { ChatBubble } from "./ChatBubble";
import { UserCameraFeed } from "./UserCamerFeed";

// Import our mock response generator
import { getMockAiResponse } from "@/lib/mockApi";

type SpeechRecognition = any;
type InterviewState = "idle" | "listening" | "processing" | "speaking";

export function InterviewWindow({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [transcript, setTranscript] = useState<InterviewTurn[]>([]);
  const [state, setState] = useState<InterviewState>("speaking");
  const [currentAiMessage, setCurrentAiMessage] = useState("");

  const ws = useRef<WebSocket | null>(null);
  const recognition = useRef<SpeechRecognition | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const firstQuestion = localStorage.getItem('firstQuestion');
    if (firstQuestion) { speak(firstQuestion); localStorage.removeItem('firstQuestion'); }

    // THE SWITCH FOR REAL-TIME COMMUNICATION
    const useMock = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

    if (!useMock) {
      // --- REAL WebSocket Logic ---
      const wsUrl = `ws://localhost:8000/ws/interviews/${sessionId}`;
      ws.current = new WebSocket(wsUrl);
      ws.current.onopen = () => console.log("WebSocket connected");
      ws.current.onclose = () => console.log("WebSocket disconnected");
      ws.current.onmessage = (event) => speak(event.data);
    }
    
    // Speech recognition setup is the same for both modes
    // ... (Your existing speech recognition setup code goes here) ...

    return () => { if (!useMock) { ws.current?.close(); } };
  }, [sessionId]);

  // This is the function that sends the user's answer
  const handleUserSpeech = async (userAnswer: string) => {
    setTranscript(prev => [...prev, { speaker: 'user', text: userAnswer }]);
    setState("processing");

    const useMock = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

    if (useMock) {
      // --- MOCK Logic ---
      const aiResponse = await getMockAiResponse(userAnswer);
      speak(aiResponse);
    } else {
      // --- REAL Logic ---
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(userAnswer);
      }
    }
  };

  // All hooks like useEffect are INSIDE the component
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
      speak(event.data);
    };
    interface IWindow extends Window { SpeechRecognition: any; webkitSpeechRecognition: any; }
    const { SpeechRecognition, webkitSpeechRecognition } = window as unknown as IWindow;
    const SpeechRecognitionAPI = SpeechRecognition || webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      recognition.current = new SpeechRecognitionAPI();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.onresult = (event: SpeechRecognition) => {
        const userAnswer = event.results[0][0].transcript;
        setTranscript(prev => [...prev, { speaker: 'user', text: userAnswer }]);
        if (ws.current?.readyState === WebSocket.OPEN) { ws.current.send(userAnswer); }
        setState("processing");
      };
      recognition.current.onend = () => { if (state === "listening") { setState("processing"); } };
    } else {
      alert("Your browser does not support Speech Recognition. Please use Google Chrome or Edge.");
    }
    return () => { ws.current?.close(); };
  }, [sessionId]);

  // All helper functions are also defined INSIDE the component, before the return statement
  const speak = (text: string) => {
    setState("speaking");
    setCurrentAiMessage(text);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      setTranscript(prev => [...prev, { speaker: 'ai', text: text }]);
      setCurrentAiMessage("");
      setState("idle");
    };
    window.speechSynthesis.speak(utterance);
  };
  
  const handleMicClick = () => {
    if (state === "idle" && recognition.current) {
      recognition.current.start();
      setState("listening");
    } else if (state === "listening" && recognition.current) {
      recognition.current.stop();
    }
  };

  const handleEndInterview = () => {
    setState("processing");
    ws.current?.close();
    router.push(`/results/${sessionId}`);
  };
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript, currentAiMessage]);

  const getButtonState = () => {
    switch (state) {
      case "idle": return { text: "Speak", color: "bg-green-500 hover:bg-green-600", disabled: false };
      case "listening": return { text: "Listening...", color: "bg-red-500 hover:bg-red-600", disabled: false };
      case "processing": return { text: "Processing...", color: "bg-yellow-500", disabled: true };
      case "speaking": return { text: "AI Speaking...", color: "bg-blue-500", disabled: true };
      default: return { text: "Speak", color: "bg-gray-500", disabled: true };
    }
  };

  const buttonState = getButtonState();

  // The return statement is at the end, also INSIDE the component
  return (
    <Card className="w-full max-w-4xl h-[95vh] flex flex-col bg-gray-800 border-gray-700 text-white overflow-hidden relative">
      <div className="flex-shrink-0">
        <InterviewerCharacter isSpeaking={state === 'speaking'} />
      </div>

      <CardContent className="flex-1 flex flex-col p-4 space-y-4 min-h-0">
        <div className="flex-grow overflow-y-auto pr-4 space-y-4">
          {transcript.map((turn, index) => (
            <ChatBubble key={`turn-${index}`} speaker={turn.speaker} message={turn.text} />
          ))}
          {state === "speaking" && (
            <ChatBubble key="ai-typing" speaker="ai" message={currentAiMessage} isTyping={true} />
          )}
          <div ref={chatEndRef} />
        </div>
      </CardContent>
      
      <div className="p-4 border-t border-gray-700 flex flex-col items-center gap-4 flex-shrink-0">
        <Button
          onClick={handleMicClick}
          disabled={buttonState.disabled}
          className={`w-48 h-16 text-xl font-bold transition-colors ${buttonState.color}`}
        >
          {buttonState.text}
        </Button>
        <Button variant="destructive" className="w-48" onClick={handleEndInterview} disabled={state === 'processing'}>
          End Interview & Get Feedback
        </Button>
      </div>

      <div className="absolute bottom-6 right-6 w-48 md:w-64 border-2 border-gray-600 rounded-lg shadow-2xl">
        <div className="w-full aspect-video">
          <UserCameraFeed />
        </div>
      </div>
    </Card>
  );
}