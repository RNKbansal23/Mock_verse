// In file: frontend/lib/api.ts

import { InterviewResponse } from "./types"; // We'll update types.ts next

/**
 * Starts a new interview by calling the real FastAPI backend.
 * @param role The job role for the interview.
 * @param resumeFile The user's resume file (optional).
 * @returns The session ID and the first AI-generated question.
 */
export const startInterview = async (
  role: string,
  resumeFile: File | null
): Promise<InterviewResponse> => {
  const formData = new FormData();
  formData.append("role", role);

  if (resumeFile) {
    formData.append("resumeFile", resumeFile);
  }

  // NOTE: Your backend needs to be updated to handle a file upload.
  // For now, let's just send the role and an empty resume text.
  // This is a placeholder for your friend to complete on the backend.
  const payload = {
    role: role,
    resume_text: "User submitted a resume, but text extraction is not yet implemented on the backend.",
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL + "/api/v1/interviews";

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to start interview on the backend.");
  }

  return response.json();
};