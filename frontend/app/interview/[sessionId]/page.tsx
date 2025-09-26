// In file: frontend/app/interview/[sessionId]/page.tsx

'use client';

// UPDATED: Import the correct 'type' for page props
import type { NextPage } from 'next';
import { InterviewWindow } from "@/components/InterviewWindow";

// UPDATED: Define a more specific type for our page's props
interface InterviewPageProps {
  params: {
    sessionId: string;
  };
}

// UPDATED: Use the new type here
const InterviewPage: NextPage<InterviewPageProps> = ({ params }) => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-800 text-white p-4">
      <InterviewWindow sessionId={params.sessionId} />
    </main>
  );
};

export default InterviewPage;