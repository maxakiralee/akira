import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Get user from Supabase auth
    const supabase = createPagesServerClient({ req, res })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    // Get user's profile with agent ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('letta_agent_id')
      .eq('user_id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile')
      return res.status(500).json({ message: "Failed to fetch user profile" })
    }

    return res.status(200).json({ 
      agentId: profile?.letta_agent_id || null,
      hasAgent: !!profile?.letta_agent_id 
    });
  } catch (error) {
    console.error("Error fetching user agent");
    return res
      .status(500)
      .json({ message: "Failed to fetch user agent" });
  }
} 