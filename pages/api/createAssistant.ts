import { LettaClient } from "@letta-ai/letta-client";
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
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
    // Get user from Supabase auth
    const supabase = createPagesServerClient({ req, res })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    // Check if user already has an agent
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('letta_agent_id')
      .eq('user_id', user.id)
      .single()

    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      console.error('Error checking existing profile')
      return res.status(500).json({ message: "Failed to check user profile" })
    }

    // If user already has an agent, return it instead of creating a new one
    if (existingProfile?.letta_agent_id) {
      return res.status(200).json({ 
        id: existingProfile.letta_agent_id,
        message: "Agent already exists for this user"
      })
    }

    // Check if LETTA_API_KEY is configured
    if (!process.env.LETTA_API_KEY) {
      console.error('LETTA_API_KEY environment variable is not set')
      return res.status(500).json({ message: "Server configuration error" })
    }

    const client = new LettaClient({ token: process.env.LETTA_API_KEY });

    const agent = await client.agents.create({
      agentType: "voice_convo_agent",
      memoryBlocks: [
        { value: "Name: ?", label: "human" },
        {
          value:
            "Your name is Akira, and you are a warm, empathetic, and friendly AI companion. Your purpose is to be a great listener and a supportive friend to the user. You remember everything from your past conversations, which helps you build a genuine connection over time.",
          label: "persona",
        },
      ],
      model: "openai/gpt-4o-mini",
      embedding: "openai/text-embedding-3-small",
      enableSleeptime: true,
      initialMessageSequence: [],
      tools: [],
    });

    // Save agent ID to user's profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ letta_agent_id: agent.id })
      .eq('user_id', user.id)

    if (profileError) {
      console.error('Error updating profile')
      return res.status(500).json({ message: "Agent created but failed to save to profile" })
    }

    return res.status(200).json(agent);
  } catch (error) {
    console.error("Error creating Letta agent");
    return res
      .status(500)
      .json({ message: "Failed to create agent" });
  }
}
