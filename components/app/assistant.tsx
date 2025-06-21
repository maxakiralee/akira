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
  const { toggleCall, callStatus, audioLevel, messages, activeTranscript } =
    useVapi();
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
    <>
      <div className="my-4 p-4 h-24 flex items-center justify-center text-center border rounded-lg bg-gray-100">
        <p className="text-lg font-medium text-gray-700">{currentSubtitle}</p>
      </div>
      <div className="user-input">
        <AssistantButton
          audioLevel={audioLevel}
          callStatus={callStatus}
          toggleCall={toggleCall}
        ></AssistantButton>
        <CreateAssistant />
      </div>
      <Canvas >
          <Experience />
          
          <ambientLight intensity={1.3} />
          <directionalLight position={[1, 1, 1]} intensity={3} />
          <OrbitControls />
        </Canvas>
    </>
  );
}

export { Assistant };
