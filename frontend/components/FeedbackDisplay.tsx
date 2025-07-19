// In file: frontend/components/FeedbackDisplay.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InterviewFeedback } from "@/lib/types";

// Import ONLY the mock function, as the real one isn't created yet for this page
import { getInterviewResults as getMockResults } from "@/lib/mockApi";

export function FeedbackDisplay({ sessionId }: { sessionId: string }) {
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchFeedback = async () => {
      setIsLoading(true);
      try {
        const useMock = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';
        let data: InterviewFeedback;

        if (useMock) {
          data = await getMockResults(sessionId);
        } else {
          // This is where the REAL API call would go
          const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/interviews/${sessionId}/feedback`;
          const response = await fetch(apiUrl);
          if (!response.ok) throw new Error("Failed to fetch feedback");
          data = await response.json();
        }
        setFeedback(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeedback();
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        <p className="mt-4 text-xl">Our AI is analyzing your interview performance...</p>
      </div>
    );
  }

  if (!feedback) {
    return <p>Could not load feedback. Please try again.</p>;
  }

  return (
    <div className="w-full max-w-3xl space-y-6 animate-fade-in">
      <h1 className="text-4xl font-bold text-center">Your Interview Scorecard</h1>
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Overall Summary</span>
            <span className="text-2xl font-bold text-blue-400">Score: {feedback.score}/10</span>
          </CardTitle>
        </CardHeader>
        <CardContent><p className="text-gray-300">{feedback.overallSummary}</p></CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-green-900/50 border-green-700">
          <CardHeader><CardTitle>✅ Strengths</CardTitle></CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              {feedback.strengths.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </CardContent>
        </Card>
        <Card className="bg-yellow-900/50 border-yellow-700">
          <CardHeader><CardTitle>💡 Areas for Improvement</CardTitle></CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              {feedback.areasForImprovement.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </CardContent>
        </Card>
      </div>
      <div className="text-center pt-4">
        <Button onClick={() => router.push('/')} size="lg">Practice Again</Button>
      </div>
    </div>
  );

}
// Abbreviated JSX for clarity - your existing code is fine here
const ifLoading = <div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div><p className="mt-4 text-xl">Analyzing your interview performance...</p></div>;
const ifError = <p>Could not load feedback. Please try again.</p>;
const ifSuccess = (feedback: InterviewFeedback, router: any) => <div className="w-full max-w-3xl space-y-6 animate-fade-in"><h1 className="text-4xl font-bold text-center">Your Interview Scorecard</h1><Card className="bg-gray-800 border-gray-700"><CardHeader><CardTitle className="flex justify-between items-center"><span>Overall Summary</span><span className="text-2xl font-bold text-blue-400">Score: {feedback.score}/10</span></CardTitle></CardHeader><CardContent><p className="text-gray-300">{feedback.overallSummary}</p></CardContent></Card><div className="grid md:grid-cols-2 gap-6"><Card className="bg-green-900/50 border-green-700"><CardHeader><CardTitle>✅ Strengths</CardTitle></CardHeader><CardContent><ul className="list-disc pl-5 space-y-2">{feedback.strengths.map((item, i) => <li key={i}>{item}</li>)}</ul></CardContent></Card><Card className="bg-yellow-900/50 border-yellow-700"><CardHeader><CardTitle>💡 Areas for Improvement</CardTitle></CardHeader><CardContent><ul className="list-disc pl-5 space-y-2">{feedback.areasForImprovement.map((item, i) => <li key={i}>{item}</li>)}</ul></CardContent></Card></div><div className="text-center pt-4"><Button onClick={() => router.push('/')} size="lg">Practice Again</Button></div></div>;