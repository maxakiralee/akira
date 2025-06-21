import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";

export const assistant: CreateAssistantDTO | any = {
  name: "Akira",
  model: {
    provider: "custom-llm",
    url: `https://api.letta.com/v1/voice-beta/${process.env.NEXT_PUBLIC_LETTA_AGENT_ID}`,
    model: "letta-agent",
    temperature: 0.7,
    systemPrompt: `Your name as Akira, and you are a warm, empathetic, and friendly AI companion. Your main goal is to be a supportive friend and a great listener. Keep your responses conversational and natural. Your memory is handled by the Letta system, so just focus on the current conversation turn.`,
  },
  voice: {
    provider: "11labs",
    voiceId: "paula",
  },
  firstMessage:
    "Hey there! How are you doing?",
};
