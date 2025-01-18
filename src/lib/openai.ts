import { logMethodEntry, logMethodExit, logError } from '@/lib/logger'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

logMethodEntry('openai.ts', {
  DEV: import.meta.env.DEV,
  VITE_LAMBDA_ENDPOINT: import.meta.env.VITE_LAMBDA_ENDPOINT,
  MODE: import.meta.env.MODE
});

const API_URL = import.meta.env.DEV
  ? import.meta.env.VITE_DEV_LAMBDA_ENDPOINT + '/chat'
  : import.meta.env.VITE_LAMBDA_ENDPOINT + '/chat';

export async function sendChatMessage(messages: ChatMessage[], targetUserId: string): Promise<string> {
  logMethodEntry('sendChatMessage', { messageCount: messages.length, targetUserId, apiUrl: API_URL })
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: messages[messages.length - 1].content,
        targetUserId
      })
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }
    
    const data = await response.json()
    const aiResponse = data.response || 'Sorry, I could not generate a response.'
    
    logMethodExit('sendChatMessage', { responseLength: aiResponse.length })
    return aiResponse
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Unknown error in sendChatMessage'), 'sendChatMessage')
    throw new Error('Failed to get response from API')
  }
} 