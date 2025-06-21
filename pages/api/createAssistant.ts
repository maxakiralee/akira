import { LettaClient } from "@letta-ai/letta-client";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const client = new LettaClient({ token: process.env.LETTA_API_KEY });

    const agent = await client.agents.create({
      agentType: "voice_convo_agent",
      memoryBlocks: [
        { value: "Name: ?", label: "human" },
        {
          value:
            "Your name as Akira, and you are a warm, empathetic, and friendly AI companion. Your purpose is to be a great listener and a supportive friend to the user. You remember everything from your past conversations, which helps you build a genuine connection over time.",
            label: "persona",
        },
      ],
      model: "openai/gpt-4o-mini",
      embedding: "openai/text-embedding-3-small",
      enableSleeptime: true,
      initialMessageSequence: [],
      tools: [],
    });

    return res.status(200).json(agent);
  } catch (error) {
    console.error("Error creating Letta agent:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return res
      .status(500)
      .json({ message: "Failed to create agent", error: errorMessage });
  }
}
