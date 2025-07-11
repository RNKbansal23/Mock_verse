// In file: frontend/app/results/[sessionId]/page.tsx

import { FeedbackDisplay } from "@/components/FeedbackDisplay";

export default function ResultsPage({ params }: { params: { sessionId: string } }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-4">
      <FeedbackDisplay sessionId={params.sessionId} />
    </main>
  );
}