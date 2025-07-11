// In file: frontend/components/StartInterviewForm.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// UPDATED: Import from the REAL api.ts file
import { startInterview } from "@/lib/api";

export function StartInterviewForm() {
  const [role, setRole] = useState("Software Engineer");
  const [isLoading, setIsLoading] = useState(false);
  const [resume, setResume] = useState<File | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setResume(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role.trim()) {
      alert("Please enter a job role.");
      return;
    }

    setIsLoading(true);

    try {
      // UPDATED: Call the real API function
      const { session_id, first_question } = await startInterview(role, resume);

      // We still use local storage to pass the first question to the next page
      localStorage.setItem('firstQuestion', first_question);

      // Navigate to the interview page with the real session ID
      router.push(`/interview/${session_id}`);
    } catch (error) {
      console.error("Failed to start interview:", error);
      alert("Could not start the interview. Please check if the backend is running and try again.");
      setIsLoading(false);
    }
  };

  // The rest of the JSX is the same
  return (
    <Card className="w-full max-w-md bg-card border">
      <CardHeader>
        <CardTitle>Start Your Mock Interview</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="role">Job Role You're Applying For</Label>
            <Input
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., Senior Product Manager"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resume-upload">Upload Your Resume (Optional)</Label>
            <Label
              htmlFor="resume-upload"
              className="flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer hover:bg-accent"
            >
              Choose File
            </Label>
            <Input
              id="resume-upload"
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt"
            />
            {resume && (
              <p className="text-sm text-muted-foreground pt-2">
                Selected: <span className="font-medium text-foreground">{resume.name}</span>
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Preparing..." : "Start Interview"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}