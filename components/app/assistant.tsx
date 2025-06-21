"use client";

import { useVapi } from "../../hooks/useVapi";
import { AssistantButton } from "./assistantButton";
import { CreateAssistant } from "@/components/app/createAssistant";
import { useEffect, useState } from "react";
import { TranscriptMessage } from "@/lib/types/conversation.type";
import { Experience } from "./Experience";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function Assistant() {
  const {
    toggleCall,
    callStatus,
    audioLevel,
    messages,
    activeTranscript,
    isSpeechActive,
  } = useVapi();
  const [currentSubtitle, setCurrentSubtitle] = useState("");

  useEffect(() => {
    if (activeTranscript && activeTranscript.role === "assistant") {
      setCurrentSubtitle(activeTranscript.transcript);
    } else {
      // When the live transcript is not active, find the last completed one.
      const latestAssistantMessage = [...messages]
        .reverse()
        .find(
          (msg: any) => msg.type === "transcript" && msg.role === "assistant"
        );

      if (latestAssistantMessage) {
        setCurrentSubtitle(
          (latestAssistantMessage as TranscriptMessage).transcript
        );
      }
    }
  }, [messages, activeTranscript]);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Background Canvas */}
      <div className="absolute top-0 left-0 w-full h-full z-[-1]">
        <Canvas>
          <Experience isSpeaking={isSpeechActive} />
          <ambientLight intensity={1.3} />
          <directionalLight position={[1, 1, 1]} intensity={1} />
          <directionalLight position={[-1, -1, -1]} intensity={1} />
          <OrbitControls />
        </Canvas>
      </div>

      {/* Foreground Content */}
      <div className="absolute top-0 left-0 w-full h-full flex items-center">
        <div className="w-1/2 flex flex-col items-center justify-center">
          <h1 className="text-7xl font-bold text-black">Hi, I'm Akira</h1>
          <button
            onClick={toggleCall}
            className="mt-4 text-lg text-gray-700 hover:text-black transition-colors"
          >
            Click to Begin
          </button>
        </div>
        {/* The right half is intentionally empty to show the canvas behind it */}
        <div className="w-1/2"></div>
      </div>

      {/* Bottom Right UI Elements */}
      <div className="absolute bottom-8 right-8 flex flex-col items-end space-y-4">
        <div className="my-4 p-4 h-24 w-80 flex items-center justify-center text-center border rounded-lg bg-gray-100 bg-opacity-75">
          <p className="text-lg font-medium text-gray-700">{currentSubtitle}</p>
        </div>
        <div className="flex space-x-2">
          <AssistantButton
            audioLevel={audioLevel}
            callStatus={callStatus}
            toggleCall={toggleCall}
          />
          <CreateAssistant />
        </div>
      </div>
    </div>
  );
}

export { Assistant };
