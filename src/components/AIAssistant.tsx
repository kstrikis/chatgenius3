import React, { useState } from 'react'
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

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!inputText.trim() || isLoading || !selectedUserId) return

    logMethodEntry('AIAssistant.handleSubmit')
    setIsLoading(true)

    try {
      const userMessage = { role: 'user' as const, content: inputText }
      setMessages([...messages, userMessage])
      setInputText('')

      const response = await sendChatMessage([userMessage], selectedUserId)
      setMessages(messages => [...messages, { role: 'assistant', content: response }])
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
          onValueChange={(value) => setSelectedUserId(value === "default" ? null : value)}
        >
          <SelectTrigger className="w-full text-gray-900">
            <SelectValue defaultValue="default" placeholder="Select a user..." />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="default" className="text-gray-900">
                Select a user...
              </SelectItem>
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
        {messages.map((message, index) => (
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
            placeholder={selectedUserId ? "Ask this user anything..." : "Select a user first..."}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading || !selectedUserId}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !selectedUserId}
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