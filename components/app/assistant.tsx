"use client";

import { useVapi } from "../../hooks/useVapi";
import { AssistantButton } from "./assistantButton";
import { useEffect, useState } from "react";
import { TranscriptMessage } from "@/lib/types/conversation.type";
import { Experience } from "./Experience";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthForm } from "@/components/auth/AuthForm";
import { createAssistant } from "@/assistants/assistant";

function Assistant() {
  const { user, loading, signOut } = useAuth();
  const [userAgent, setUserAgent] = useState<any>(null);
  const [agentLoading, setAgentLoading] = useState(false);
  
  // Create assistant configuration with user's agent ID
  const assistantConfig = userAgent?.agentId ? createAssistant(userAgent.agentId) : null;
  
  const {
    toggleCall,
    callStatus,
    audioLevel,
    messages,
    activeTranscript,
    isSpeechActive,
  } = useVapi(assistantConfig);
  const [currentSubtitle, setCurrentSubtitle] = useState("");

  // Fetch user agent when authenticated
  useEffect(() => {
    const fetchUserAgent = async () => {
      if (user && !userAgent) {
        setAgentLoading(true);
        try {
          const response = await fetch('/api/getUserAgent');
          if (response.ok) {
            const data = await response.json();
            setUserAgent(data);
          }
        } catch (error) {
          console.error('Error fetching user agent');
        } finally {
          setAgentLoading(false);
        }
      }
    };

    fetchUserAgent();
  }, [user, userAgent]);

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
          {!user && <h1 className="text-7xl font-bold text-black">Hi, I&apos;m Akira</h1>}
          
          {loading ? (
            <p className="mt-4 text-lg text-gray-700">Loading...</p>
          ) : !user ? (
            <div className="mt-8">
              <AuthForm onAuthSuccess={() => setUserAgent(null)} />
            </div>
          ) : agentLoading ? (
            <p className="mt-4 text-lg text-gray-700">Setting up your AI companion...</p>
          ) : userAgent && !userAgent.hasAgent ? (
            <div className="mt-4 text-center">
              <p className="text-lg text-gray-700 mb-4">Setting up your AI companion...</p>
            </div>
          ) : null}
        </div>
        
        {/* Right half with transcript next to the 3D head */}
        <div className="w-1/2 flex items-center justify-center pl-16">
          {currentSubtitle && (
            <div className="max-w-md">
              <p className="text-lg font-medium text-black">{currentSubtitle}</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Right UI Elements */}
      <div className="absolute bottom-8 right-8 flex flex-col items-end space-y-4">
        {/* Agent Object Display (for validation) */}
        {user && process.env.NODE_ENV === 'development' && (
          <div className="p-3 max-w-md bg-black/20 backdrop-blur-sm rounded-lg text-white text-xs">
            {agentLoading ? (
              <p><strong>Status:</strong> Loading agent...</p>
            ) : userAgent ? (
              <>
                <p><strong>Agent Status:</strong> {userAgent.hasAgent ? 'Connected' : 'No Agent'}</p>
                {userAgent.agentId && <p><strong>Agent ID:</strong> {userAgent.agentId}</p>}
              </>
            ) : (
              <p><strong>Status:</strong> Checking agent status...</p>
            )}
          </div>
        )}
        
        {/* Sign Out Button */}
        {user && (
          <button
            onClick={signOut}
            className="text-sm text-gray-500 hover:text-gray-700 underline bg-white/80 px-3 py-1 rounded"
          >
            Sign Out
          </button>
        )}
      </div>

      {/* Microphone Button - Center Bottom */}
      {user && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <AssistantButton
            audioLevel={audioLevel}
            callStatus={callStatus}
            toggleCall={toggleCall}
          />
        </div>
      )}
    </div>
  );
}

export { Assistant };
