// In file: frontend/lib/api.ts

import { InterviewResponse } from "./types";

/**
 * Starts a new interview by calling the real FastAPI backend.
 * @param role The job role for the interview.
 * @param resumeFile The user's resume file (optional).
 * @returns The session ID and the AI-generated first question.
 */
export const startInterview = async (
  role: string,
  resumeFile: File | null
): Promise<InterviewResponse> => {
  // UPDATED: We use FormData to send a file and text together.
  const formData = new FormData();
  formData.append("role", role);

  if (resumeFile) {
    formData.append("resumeFile", resumeFile);
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL + "/api/v1/interviews";

  // UPDATED: The fetch call is now simpler.
  // We send the formData object directly.
  // CRUCIAL: We do NOT set the 'Content-Type' header. The browser will do it
  // for us automatically, including the necessary 'boundary' for multipart/form-data.
  const response = await fetch(apiUrl, {
    method: "POST",
    body: formData, // Send the form data
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Error from backend:", errorBody);
    throw new Error("Failed to start interview on the backend.");
  }

  return response.json();
};