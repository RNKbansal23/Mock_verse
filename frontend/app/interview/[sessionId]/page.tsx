
 import { InterviewWindow } from "@/components/InterviewWindow";

export default function InterviewPage({ params }: { params: { sessionId: string } }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-4">
      <InterviewWindow sessionId={params.sessionId} />
    </main>
  );
}