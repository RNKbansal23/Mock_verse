// In file: frontend/components/InterviewWindow.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InterviewTurn } from "@/lib/types";
import { InterviewerCharacter } from "./InterviewerCharacter";
import { ChatBubble } from "./ChatBubble";
import { UserCameraFeed } from "./UserCameraFeed";
import { CountdownTimer } from "./CountdownTimer";

// CRITICAL FIX: Import the mock response generator
import { getMockAiResponse } from "@/lib/mockApi";

type SpeechRecognition = any;
type InterviewState = "idle" | "listening" | "processing" | "speaking";

export function InterviewWindow({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [transcript, setTranscript] = useState<InterviewTurn[]>([]);
  const [state, setState] = useState<InterviewState>("speaking");
  const [displayedAiText, setDisplayedAiText] = useState("");
  const [currentUserText, setCurrentUserText] = useState("");
  const [countdown, setCountdown] = useState<number | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const recognition = useRef<SpeechRecognition | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const firstQuestion = localStorage.getItem('firstQuestion');
    if (firstQuestion) { speak(firstQuestion); localStorage.removeItem('firstQuestion'); }

    // CRITICAL FIX: The Master Switch for real-time communication
    const useMock = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

    if (!useMock) {
      // --- REAL WebSocket Logic (only runs if mock mode is OFF) ---
      const wsUrl = `ws://localhost:8000/ws/interviews/${sessionId}`;
      ws.current = new WebSocket(wsUrl);
      ws.current.onopen = () => console.log("WebSocket connected");
      ws.current.onclose = () => console.log("WebSocket disconnected");
      ws.current.onmessage = (event) => speak(event.data);
    }
    
    // Speech recognition setup is the same for both modes
    interface IWindow extends Window { SpeechRecognition: any; webkitSpeechRecognition: any; }
    const { SpeechRecognition, webkitSpeechRecognition } = window as unknown as IWindow;
    const SpeechRecognitionAPI = SpeechRecognition || webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      recognition.current = new SpeechRecognitionAPI();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      recognition.current.onresult = (event: SpeechRecognition) => {
        if (countdownInterval.current) clearInterval(countdownInterval.current);
        setCountdown(null);
        let fullTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript;
        }
        setCurrentUserText(fullTranscript);
      };
      recognition.current.onend = () => {
        if (state === "listening") {
          setCountdown(6);
          countdownInterval.current = setInterval(() => {
            setCountdown(prev => {
              if (prev === null || prev <= 1) {
                if (countdownInterval.current) clearInterval(countdownInterval.current);
                if (currentUserText) { handleUserSpeech(currentUserText); }
                return null;
              }
              return prev - 1;
            });
          }, 1000);
        }
      };
    } else {
      alert("Your browser does not support Speech Recognition. Please use Google Chrome or Edge.");
    }
    return () => { if (!useMock) { ws.current?.close(); } };
  }, [sessionId]);

  const speak = (text: string) => {
    setState("speaking");
    setDisplayedAiText("");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onboundary = (event) => {
      setDisplayedAiText(text.substring(0, event.charIndex + event.charLength));
    };
    utterance.onend = () => {
      setDisplayedAiText(text);
      setTranscript(prev => [...prev, { speaker: 'ai', text: text }]);
      // Automatically start listening
      if (recognition.current) {
        setCurrentUserText("");
        recognition.current.start();
        setState("listening");
      } else {
        setState("idle");
      }
    };
    window.speechSynthesis.speak(utterance);
  };
  
  const handleMicClick = () => {
    if (state === "listening" && recognition.current) {
      recognition.current.stop();
      if (countdownInterval.current) clearInterval(countdownInterval.current);
      setCountdown(null);
      if (currentUserText) {
        handleUserSpeech(currentUserText);
      } else {
        setState("idle");
      }
    }
  };

  // CRITICAL FIX: This function now contains the mock/real switch
  const handleUserSpeech = async (userAnswer: string) => {
    setTranscript(prev => [...prev, { speaker: 'user', text: userAnswer }]);
    setCurrentUserText("");
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
      } else {
        console.error("WebSocket is not connected.");
      }
    }
  };

  const handleEndInterview = () => {
    if (state === 'listening' && recognition.current) {
      recognition.current.stop();
    }
    setState("processing");
    ws.current?.close();
    router.push(`/results/${sessionId}`);
  };
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript, displayedAiText, currentUserText]);

  const getButtonState = () => {
    switch (state) {
      case "idle": return { text: "Ready...", color: "bg-gray-500", disabled: true };
      case "listening": return { text: "Listening...", color: "bg-red-500 hover:bg-red-600", disabled: false };
      case "processing": return { text: "Processing...", color: "bg-yellow-500", disabled: true };
      case "speaking": return { text: "AI Speaking...", color: "bg-blue-500", disabled: true };
      default: return { text: "Speak", color: "bg-gray-500", disabled: true };
    }
  };

  const buttonState = getButtonState();

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
            <ChatBubble key="ai-speaking" speaker="ai" message={displayedAiText} />
          )}
          {state === "listening" && currentUserText && (
            <ChatBubble key="user-speaking" speaker="user" message={currentUserText} />
          )}
          <div ref={chatEndRef} />
        </div>
      </CardContent>
      <div className="p-4 border-t border-gray-700 flex flex-col items-center gap-4 flex-shrink-0">
        {countdown !== null && <CountdogitwnTimer secondsRemaining={countdown} />}
        <Button onClick={handleMicClick} disabled={buttonState.disabled} className={`w-48 h-16 text-xl font-bold transition-colors ${buttonState.color}`}>
          {buttonState.text}
        </Button>
        <Button variant="destructive" className="w-48" onClick={handleEndInterview} disabled={state === 'processing' || state === 'speaking'}>
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