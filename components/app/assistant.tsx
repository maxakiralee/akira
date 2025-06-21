"use client";

import { useVapi } from "../../hooks/useVapi";
import { AssistantButton } from "./assistantButton";
import { Display } from "./display";
import { CreateAssistant } from "@/components/app/createAssistant";

function Assistant() {
  const { toggleCall, callStatus, audioLevel } = useVapi();
  return (
    <>
      <div className="chat-history">
        <Display />
      </div>
      <div className="user-input">
        <AssistantButton
          audioLevel={audioLevel}
          callStatus={callStatus}
          toggleCall={toggleCall}
        ></AssistantButton>
        <CreateAssistant />
      </div>
    </>
  );
}

export { Assistant };
