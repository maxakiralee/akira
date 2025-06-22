import { NextApiRequest, NextApiResponse } from 'next';
import Anthropic from '@anthropic-ai/sdk';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const supabase = createServerSupabaseClient({ req, res });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    // Fetch the image data
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image');
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');
    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

    // Analyze image with Claude Vision
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: "Please describe this image in detail. Focus on what you see, any text present, objects, people, scenes, or anything notable. Be descriptive but concise."
          },
        ],
      }],
    });

    const description = message.content[0].type === 'text' ? message.content[0].text : 'Unable to analyze image';

    return res.status(200).json({ 
      success: true, 
      description 
    });

  } catch (error) {
    console.error('Error analyzing image:', error);
    return res.status(500).json({ error: 'Failed to analyze image' });
  }
} 