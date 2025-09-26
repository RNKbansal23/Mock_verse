// In file: frontend/app/interview/[sessionId]/page.tsx

'use client';

import { InterviewWindow } from "@/components/InterviewWindow";

// Define the shape of our props directly
interface InterviewPageProps {
  params: {
    sessionId: string;
  };
}

// THIS IS THE NEW, SIMPLIFIED COMPONENT DEFINITION
export default function InterviewPage({ params }: InterviewPageProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-800 text-white p-4">
      <InterviewWindow sessionId={params.sessionId} />
    </main>
  );
}