// In file: frontend/components/FeedbackDisplay.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InterviewFeedback } from "@/lib/types";
import { getInterviewResults } from "@/lib/mockApi";

export function FeedbackDisplay({ sessionId }: { sessionId: string }) {
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchFeedback = async () => {
      setIsLoading(true);
      // BACKEND: Get the mock feedback
      const results = await getInterviewResults(sessionId);
      setFeedback(results);
      setIsLoading(false);
    };

    fetchFeedback();
  }, [sessionId]);

  if (isLoading) {
    return <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        <p className="mt-4">Analyzing your interview...</p>
    </div>;
  }

  if (!feedback) {
    return <p>Could not load feedback.</p>;
  }

  return (
    <div className="w-full max-w-3xl space-y-6">
        <h1 className="text-4xl font-bold text-center">Your Interview Feedback</h1>
        <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
                <CardTitle>Overall Summary (Score: {feedback.score}/10)</CardTitle>
            </CardHeader>
            <CardContent><p>{feedback.overallSummary}</p></CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-green-900/50 border-green-700">
                <CardHeader><CardTitle>Strengths</CardTitle></CardHeader>
                <CardContent>
                    <ul className="list-disc pl-5 space-y-2">
                        {feedback.strengths.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </CardContent>
            </Card>
            <Card className="bg-yellow-900/50 border-yellow-700">
                <CardHeader><CardTitle>Areas for Improvement</CardTitle></CardHeader>
                <CardContent>
                    <ul className="list-disc pl-5 space-y-2">
                        {feedback.areasForImprovement.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </CardContent>
            </Card>
        </div>
        <div className="text-center">
            <Button onClick={() => router.push('/')}>Practice Again</Button>
        </div>
    </div>
  );
}