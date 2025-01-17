import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChatMessage, sendChatMessage } from '@/lib/openai'
import { logMethodEntry, logMethodExit, logError } from '@/lib/logger'

export function AIAssistant(): JSX.Element {
  logMethodEntry('AIAssistant')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'system',
      content: 'You are a helpful AI assistant in a chat application. Keep your responses concise and friendly.'
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!inputText.trim() || isLoading) return

    logMethodEntry('AIAssistant.handleSubmit')
    setIsLoading(true)

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: 'user' as const, content: inputText }
    ]

    try {
      setMessages(newMessages)
      setInputText('')

      const response = await sendChatMessage(newMessages)
      setMessages([...newMessages, { role: 'assistant' as const, content: response }])
    } catch (error) {
      logError(error instanceof Error ? error : new Error('Failed to send message'), 'AIAssistant.handleSubmit')
    } finally {
      setIsLoading(false)
    }

    logMethodExit('AIAssistant.handleSubmit')
  }

  const result = (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.slice(1).map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-purple-100 text-purple-900'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 rounded-lg p-3">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  )

  logMethodExit('AIAssistant')
  return result
} 