// In file: frontend/lib/mockApi.ts

import { InterviewFeedback, InterviewTurn } from "./types";

// Helper function to simulate network delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * BACKEND MOCK: Starts a new interview.
 * In the real app, this would make a POST request to /api/interviews.
 */
export const startInterview = async (role: string): Promise<{ sessionId: string, firstQuestion: string }> => {
  console.log(`Starting mock interview for role: ${role}`);
  await sleep(1000); // Simulate network latency
  const sessionId = `mock-session-${Date.now()}`;
  const firstQuestion = `Okay, thank you for coming in today. Can you tell me about your experience as a ${role}?`;
  console.log(`Mock session created: ${sessionId}`);
  return { sessionId, firstQuestion };
};

/**
 * BACKEND MOCK: Sends the user's answer and gets the next AI question.
 * In the real app, this would send data over a WebSocket or an HTTP request.
 */
export const sendUserResponse = async (sessionId: string, answer: string): Promise<string> => {
  console.log(`Sending mock user response for session ${sessionId}: "${answer}"`);
  await sleep(1500); // Simulate AI "thinking" time
  const nextQuestion = "That's interesting. Can you elaborate on the most challenging project you've worked on in that context?";
  console.log("Received mock AI response.");
  return nextQuestion;
};

/**
 * BACKEND MOCK: Ends the interview and gets the feedback.
 * In the real app, this would make a POST request to /api/interviews/{sessionId}/end.
 */
export const getInterviewResults = async (sessionId: string): Promise<InterviewFeedback> => {
  console.log(`Getting mock interview results for session ${sessionId}`);
  await sleep(2000); // Simulate feedback generation time

  const mockFeedback: InterviewFeedback = {
    overallSummary: "A solid interview. The candidate demonstrated good foundational knowledge but could improve on providing more specific, data-driven examples.",
    strengths: [
      "Clear and concise communication.",
      "Good understanding of core concepts related to the role.",
      "Positive and professional demeanor."
    ],
    areasForImprovement: [
      "Use the STAR (Situation, Task, Action, Result) method to structure answers more effectively.",
      "Provide more quantifiable results when discussing past projects.",
      "Could be more proactive in asking clarifying questions."
    ],
    score: 7,
  };

  console.log("Mock feedback generated.");
  return mockFeedback;
};