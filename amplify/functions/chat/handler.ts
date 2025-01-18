import type { APIGatewayProxyHandler } from "aws-lambda";
import OpenAI from "openai";
import { createClient } from '@supabase/supabase-js';

interface ChatRequest {
  query: string;
  targetUserId: string;
}

interface UserData {
  id: string;
  name: string;
  messages: string[];
}

interface Message {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}

// Get environment-specific Supabase credentials
const isDevelopment = process.env.NODE_ENV === 'development';
const supabaseUrl = isDevelopment ? process.env.DEV_SUPABASE_URL : process.env.SUPABASE_URL;
const supabaseKey = isDevelopment ? process.env.DEV_SUPABASE_SERVICE_ROLE_KEY : process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Lambda environment:', {
  isDevelopment,
  hasSupabaseUrl: !!supabaseUrl,
});

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  throw new Error('Missing Supabase credentials');
}

if (!process.env.OPENAI_API_KEY) {
  console.error('Missing OpenAI API key');
  throw new Error('Missing OpenAI API key');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getUserMessages(userId: string): Promise<UserData | null> {
  try {
    // Get user details
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, name')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user:', userError);
      return null;
    }

    // Get user's messages
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('content')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return null;
    }

    return {
      id: userData.id,
      name: userData.name,
      messages: messages.map(m => m.content)
    };
  } catch (error) {
    console.error('Error in getUserMessages:', error);
    return null;
  }
}

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log("Chat event:", event);

  try {
    // Parse request body
    if (!event.body) {
      throw new Error("Missing request body");
    }

    const { query, targetUserId }: ChatRequest = JSON.parse(event.body);
    
    if (!query || !targetUserId) {
      throw new Error("Missing required fields: query and targetUserId");
    }

    // Get user data from Supabase
    const userData = await getUserMessages(targetUserId);
    if (!userData) {
      throw new Error(`User not found: ${targetUserId}`);
    }

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Construct the messages array
    const messages = [
      {
        role: "system",
        content: `Following are a list of chat messages from user "${userData.name}" and you are to speak in the role of that user, being able to answer specific questions based on what they have previously said. Here are their messages in chronological order:\n\n${JSON.stringify(userData.messages, null, 2)}`
      },
      {
        role: "user",
        content: query
      }
    ];

    // Get OpenAI response
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages as any[],
      temperature: 0.7,
      max_tokens: 500
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({
        message: "Chat response",
        response: completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.",
        timestamp: new Date().toISOString(),
      })
    };

  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: error instanceof Error && error.message === "Unauthorized" ? 401 : 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({
        message: "Error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      })
    };
  }
}; 