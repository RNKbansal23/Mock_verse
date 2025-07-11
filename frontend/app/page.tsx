// In file: frontend/app/page.tsx

import { StartInterviewForm } from "@/components/StartInterviewForm";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <div className="container mx-auto flex flex-col items-center justify-center gap-6 p-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Welcome to MockVerse
        </h1>
        <p className="max-w-xl text-lg text-gray-400">
          Practice your job interviews with our advanced AI. Get instant,
          actionable feedback to land your dream job.
        </p>
         <StartInterviewForm /> 
      </div>
    </main>
  );
}