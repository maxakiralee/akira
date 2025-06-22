"use client";

import { useVapi, CALL_STATUS } from "../../hooks/useVapi";
import { AssistantButton } from "./assistantButton";
import { useEffect, useState } from "react";
import { TranscriptMessage, Message, MessageTypeEnum } from "@/lib/types/conversation.type";
import { Experience } from "./Experience";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthForm } from "@/components/auth/AuthForm";
import { createAssistant } from "@/assistants/assistant";
import dynamic from 'next/dynamic';
import ImageUploadButton from './ImageUploadButton';
import ImageUploadPanel from './ImageUploadPanel';
import CosmeticsButton from './CosmeticsButton';
import CosmeticsPanel from './CosmeticsPanel';
import { RobotProvider } from './RobotContext';

const FluidBackground = dynamic(() => import('../ui/fluidBackground'), {
  ssr: false,
});

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
    messages: vapiMessages,
    activeTranscript,
    isSpeechActive,
  } = useVapi(assistantConfig);
  
  const [currentSubtitle, setCurrentSubtitle] = useState("");
  const [isCosmeticsOpen, setIsCosmeticsOpen] = useState(false);
  const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);

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
      // When the live transcript is not active, find the last completed message
      const latestMessage = [...vapiMessages]
        .reverse()
        .find((msg: any) => {
          if (msg.type === MessageTypeEnum.TRANSCRIPT && msg.role === "assistant") {
            return true;
          }
          return false;
        });

      if (latestMessage && latestMessage.type === MessageTypeEnum.TRANSCRIPT) {
        setCurrentSubtitle((latestMessage as TranscriptMessage).transcript);
      }
    }
  }, [vapiMessages, activeTranscript]);

  return (
    <RobotProvider>
      <div className="relative w-screen h-screen overflow-hidden">
      {/* Fluid Background Canvas */}
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <FluidBackground />
      </div>

      {/* 3D Robot Canvas */}
      <div className="absolute top-0 left-0 w-full h-full z-[1]">
        <Canvas>
          <Experience isSpeaking={isSpeechActive} />
          <ambientLight intensity={1.3} />
          <directionalLight position={[1, 1, 1]} intensity={3} />
          <directionalLight position={[-1, -1, 1]} intensity={3} />
          <OrbitControls />
        </Canvas>
      </div>

      {/* Foreground Content */}
      <div className="absolute top-0 left-0 w-full h-full flex items-center z-10">
        <div className="w-1/2 flex flex-col items-center justify-center">
          {!user && (
            <h1 className="text-7xl font-light text-slate-700 mb-8 tracking-wide">
              Hi, I&apos;m Akira
            </h1>
          )}
          
          {loading ? (
            <div className="bg-slate-100/80 backdrop-blur-sm rounded-2xl p-6 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.8)]">
              <p className="text-lg text-slate-600">Loading...</p>
            </div>
          ) : !user ? (
            <div className="mt-8">
              <AuthForm onAuthSuccess={() => setUserAgent(null)} />
            </div>
          ) : agentLoading ? (
            <div className="bg-slate-100/80 backdrop-blur-sm rounded-2xl p-6 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.8)]">
              <p className="text-lg text-slate-600">Setting up your AI companion...</p>
            </div>
          ) : userAgent && !userAgent.hasAgent ? (
            <div className="mt-4 text-center">
              <div className="bg-slate-100/80 backdrop-blur-sm rounded-2xl p-6 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.8)]">
                <p className="text-lg text-slate-600 mb-4">Setting up your AI companion...</p>
              </div>
            </div>
          ) : null}
        </div>
        
        {/* Right half with transcript next to the 3D head */}
        <div className="w-1/2 flex items-center justify-center pl-16">
          {currentSubtitle && (
            <div className="max-w-md bg-slate-100/60 backdrop-blur-sm rounded-2xl p-6 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.8)]">
              <p className="text-lg font-medium text-slate-700">{currentSubtitle}</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Right UI Elements */}
      <div className="absolute bottom-8 right-8 flex flex-col items-end space-y-4 z-50">
        {/* Agent Object Display (for validation) */}
        {user && process.env.NODE_ENV === 'development' && (
          <div className="p-3 max-w-md bg-slate-100/80 backdrop-blur-sm rounded-xl shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.8)] text-slate-600 text-xs">
            {agentLoading ? (
              <p><strong>Status:</strong> Loading agent...</p>
            ) : userAgent ? (
              <>
                <p><strong>Agent Status:</strong> {userAgent.hasAgent ? 'Connected' : 'No Agent'}</p>

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
            className="text-sm text-slate-500 hover:text-slate-700 bg-slate-100/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.8)] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(255,255,255,0.9)] transition-all duration-200"
          >
            Sign Out
          </button>
        )}
      </div>

      {/* Bottom Left Controls - Cosmetics and Image Upload */}
      {user && userAgent?.agentId && (
        <div className="absolute bottom-8 left-8 z-50 flex items-center space-x-4">
          {/* Cosmetics Button */}
          <CosmeticsButton 
            isOpen={isCosmeticsOpen} 
            onToggle={() => setIsCosmeticsOpen(!isCosmeticsOpen)} 
          />
          
          {/* Image Upload Button */}
          <ImageUploadButton 
            isOpen={isImageUploadOpen} 
            onToggle={() => setIsImageUploadOpen(!isImageUploadOpen)}
            isCallActive={callStatus === CALL_STATUS.ACTIVE}
          />
        </div>
      )}

      {/* Bottom Center Control - Microphone */}
      {user && userAgent?.agentId && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <AssistantButton
            audioLevel={audioLevel}
            callStatus={callStatus}
            toggleCall={toggleCall}
          />
        </div>
      )}

      {/* Cosmetics Panel */}
      <CosmeticsPanel 
        isOpen={isCosmeticsOpen} 
        onClose={() => setIsCosmeticsOpen(false)} 
      />

      {/* Image Upload Panel */}
      <ImageUploadPanel 
        isOpen={isImageUploadOpen} 
        onClose={() => setIsImageUploadOpen(false)} 
      />
      </div>
    </RobotProvider>
  );
}

export { Assistant };
