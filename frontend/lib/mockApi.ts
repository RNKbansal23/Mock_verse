// In file: frontend/lib/mockApi.ts

import { InterviewFeedback, InterviewResponse } from "./types";

// Helper function to simulate network delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * MOCK: Starts a new interview.
 */
export const startInterview = async (
  role: string,
  resumeFile: File | null
): Promise<InterviewResponse> => {
  console.log(`--- MOCK MODE: Starting interview for role: ${role} ---`);
  if (resumeFile) {
    console.log(`--- MOCK MODE: Received mock resume: ${resumeFile.name} ---`);
  }
  await sleep(1000); // Simulate network latency

  const firstQuestion = resumeFile
    ? `Thank you for uploading your resume for the ${role} position. I see you have experience with [mock skill from resume]. Can you tell me more about that?`
    : `Okay, thank you for coming in today. Can you tell me about your experience as a ${role}?`;

  return { session_id: 12345, first_question: firstQuestion };
};

/**
 * MOCK: Simulates the WebSocket conversation.
 */
const mockResponses = [
  "That's very interesting. Can you elaborate on the most challenging aspect of that?",
  "I see. And how did you measure the success of that project?",
  "Could you describe a time you had to work with a difficult team member?",
  "Thank you for sharing that. What are your salary expectations for this role?",
  "Okay, that's all the questions I have. Do you have any questions for me?"
];
let responseIndex = 0;

export const getMockAiResponse = async (userAnswer: string): Promise<string> => {
  console.log(`--- MOCK MODE: Received user answer: "${userAnswer}" ---`);
  await sleep(2000); // Simulate AI "thinking" time

  const response = mockResponses[responseIndex % mockResponses.length];
  responseIndex++;
  
  console.log(`--- MOCK MODE: Sending AI response: "${response}" ---`);
  return response;
};


/**
 * MOCK: Gets the final interview feedback.
 */
export const getInterviewResults = async (sessionId: string | number): Promise<InterviewFeedback> => {
  console.log(`--- MOCK MODE: Getting results for session ${sessionId} ---`);
  await sleep(2000);

  const mockFeedback: InterviewFeedback = {
    overallSummary: "This was a solid mock interview. The candidate provided good answers but could be more specific with examples to better showcase their skills.",
    strengths: [
      "Demonstrated clear communication.",
      "Showed a positive and professional attitude throughout.",
      "Good foundational knowledge of the role's requirements."
    ],
    areasForImprovement: [
      "Structure answers using the STAR method for better clarity.",
      "Provide more data-driven examples to quantify achievements.",
    ],
    score: 8,
  };

  return mockFeedback;
};