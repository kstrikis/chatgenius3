import OpenAI from 'openai'
import { logMethodEntry, logMethodExit, logError } from '@/lib/logger'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // We'll add a proxy later for production
})

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function sendChatMessage(messages: ChatMessage[]): Promise<string> {
  logMethodEntry('sendChatMessage', { messageCount: messages.length })
  
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      max_tokens: 500
    })

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
    logMethodExit('sendChatMessage', { responseLength: response.length })
    return response
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Unknown error in sendChatMessage'), 'sendChatMessage')
    throw new Error('Failed to get response from AI')
  }
} 