// In file: frontend/lib/types.ts

// Represents one turn in the conversation
export interface InterviewTurn {
  speaker: 'ai' | 'user';
  text: string;
}

// The shape of the data returned when starting an interview
export interface InterviewResponse {
  session_id: number;
  first_question: string;
}

// Represents the final, structured feedback (we can keep this mocked for now)
export interface InterviewFeedback {
  overallSummary: string;
  strengths: string[];
  areasForImprovement: string[];
  score: number;
}