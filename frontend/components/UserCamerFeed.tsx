// In file: frontend/components/UserCameraFeed.tsx

"use client";

import { useEffect, useRef, useState } from "react";

export function UserCameraFeed() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const getCamera = async () => {
      try {
        // Ask the user for permission to use their camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false, // We are already handling audio with the SpeechRecognition API
        });

        // If we have a video element and a stream, connect them
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Camera access was denied. Please allow camera access in your browser settings and refresh the page.");
      }
    };

    getCamera();

    // Cleanup function to stop the camera stream when the component is unmounted
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []); // The empty dependency array ensures this runs only once

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black rounded-lg text-center p-4">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted // Mute the video to prevent audio feedback loops
        className="w-full h-full object-cover transform scale-x-[-1]" // 'scale-x-[-1]' mirrors the video, which feels more natural
      />
    </div>
  );
}