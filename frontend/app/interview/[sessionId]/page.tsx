// In file: frontend/app/interview/[sessionId]/page.tsx

'use client';

import type { NextPage } from 'next';
import { InterviewWindow } from "@/components/InterviewWindow";

interface InterviewPageProps {
  params: {
    sessionId: string;
  };
}

const InterviewPage: NextPage<InterviewPageProps> = ({ params }) => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-800 text-white p-4">
      <InterviewWindow sessionId={params.sessionId} />
    </main>
  );
};

export default InterviewPage;