import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChatMessage, sendChatMessage } from '@/lib/openai'
import { logMethodEntry, logMethodExit, logError } from '@/lib/logger'
import { useChannelUsers } from '@/lib/hooks/useChannelUsers'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select"

export function AIAssistant(): JSX.Element {
  logMethodEntry('AIAssistant')
  const { users, selectedUserId, setSelectedUserId } = useChannelUsers()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Reset messages when user changes
  useEffect(() => {
    if (selectedUserId) {
      const selectedUser = users.find(u => u.id === selectedUserId)
      if (selectedUser) {
        setMessages([{
          role: 'system',
          content: `Following are a list of chat messages from user "${selectedUser.name}" and you are to speak in the role of that user, being able to answer specific questions based on what they have previously said. Here are their messages in chronological order:\n\n${JSON.stringify(selectedUser.messages, null, 2)}`
        }])
      }
    } else {
      setMessages([{
        role: 'system',
        content: 'You are a helpful AI assistant in a chat application. You help users understand the context and content of conversations in this chat. You can provide summaries, answer questions about the conversation, and help users understand the discussion topics and themes. Keep your responses concise and friendly.'
      }])
    }
  }, [selectedUserId, users])

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
      {/* User Selection */}
      <div className="p-4 border-b border-gray-200">
        <Select
          value={selectedUserId || "default"}
          onValueChange={(value: string) => setSelectedUserId(value === "default" ? null : value)}
        >
          <SelectTrigger className="w-full text-gray-900">
            <SelectValue defaultValue="default" placeholder="Select a user..." className="text-gray-900" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="default" className="text-gray-900">Select a user...</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id} className="text-gray-900">
                  {user.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

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
            placeholder={selectedUserId ? "Ask this user anything..." : "Ask about the conversation..."}
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