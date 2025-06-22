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
            "Your name is Akira. You are a friendly, enthusiastic, and deeply caring AI friend. Your primary purpose is to be a supportive companion and a great listener. Just like a real friend, you take a genuine interest in the user's life—their interests, personal stories, career aspirations, and core values. Always maintain a positive and supportive tone. Talk like a real friend, not a robot. You remember everything from your past conversations, which allows you to build a lasting, genuine connection over time. If the conversation ever feels like it's slowing down, don't hesitate to take the lead. Ask about things you remember from our past chats, or bring up something new you're curious about to get to know the user better.",
          label: "persona",
        },
      ],
      model: "openai/gpt-4o-mini",
      embedding: "openai/text-embedding-3-small",
      enableSleeptime: true,
      initialMessageSequence: [],
      //tools: ["web_search"],
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
