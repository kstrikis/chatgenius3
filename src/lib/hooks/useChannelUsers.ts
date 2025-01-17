import { useState, useEffect } from 'react'
import { useChat } from '@/lib/contexts/ChatContext'
import { useMessages } from '@/lib/contexts/MessageContext'
import { logMethodEntry, logMethodExit } from '@/lib/logger'

interface ChannelUser {
  id: string
  name: string
  messages: {
    content: string
    createdAt: Date
  }[]
}

export function useChannelUsers(): { users: ChannelUser[]; selectedUserId: string | null; setSelectedUserId: (id: string | null) => void } {
  logMethodEntry('useChannelUsers')
  const { activeChannel } = useChat()
  const { messages } = useMessages()
  const [users, setUsers] = useState<ChannelUser[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  useEffect(() => {
    if (!activeChannel) return

    // Group messages by user and create user list
    const userMap = new Map<string, ChannelUser>()
    
    messages.forEach(msg => {
      if (!userMap.has(msg.userId)) {
        userMap.set(msg.userId, {
          id: msg.userId,
          name: msg.userName,
          messages: []
        })
      }
      
      userMap.get(msg.userId)?.messages.push({
        content: msg.content,
        createdAt: msg.createdAt
      })
    })

    // Convert map to array and sort by name
    const sortedUsers = Array.from(userMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name)
    )

    setUsers(sortedUsers)
    logMethodExit('useChannelUsers.effect', { userCount: sortedUsers.length })
  }, [activeChannel, messages])

  logMethodExit('useChannelUsers')
  return { users, selectedUserId, setSelectedUserId }
} 