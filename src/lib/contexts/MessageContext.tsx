import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { logMethodEntry, logMethodExit, logInfo, logError } from '@/lib/logger'
import { useUser } from './UserContext'
import { useChat } from './ChatContext'
import { supabase } from '@/lib/supabase'
import { toDbFields } from '@/lib/utils/db'

export interface Message {
  id: string
  channelId: string
  userId: string
  userName: string
  content: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

interface MessageContextType {
  messages: Message[]
  sendMessage: (content: string) => Promise<Message>
  editMessage: (messageId: string, content: string) => Promise<void>
  deleteMessage: (messageId: string) => Promise<void>
}

const MessageContext = createContext<MessageContextType | undefined>(undefined)

interface MessageProviderProps {
  children: ReactNode
}

export function MessageProvider({ children }: MessageProviderProps): React.ReactElement {
  logMethodEntry('MessageProvider')
  const { user } = useUser()
  const { activeChannel } = useChat()
  const [messages, setMessages] = useState<Message[]>([])

  // Load messages for the active channel
  useEffect(() => {
    logMethodEntry('MessageProvider.loadMessagesEffect')
    if (!activeChannel?.id || !user?.id) {
      setMessages([])
      logMethodExit('MessageProvider.loadMessagesEffect', { reason: 'no active channel or user' })
      return
    }

    const loadMessages = async (): Promise<void> => {
      try {
        const { data: messages, error } = await supabase
          .from('messages')
          .select(`
            id,
            channel_id,
            user_id,
            content,
            created_at,
            updated_at,
            deleted_at,
            users:user_id (
              name
            )
          `)
          .eq('channel_id', activeChannel.id)
          .order('created_at', { ascending: true })

        if (error) {
          throw error
        }

        const formattedMessages = messages.map(msg => ({
          id: msg.id,
          channelId: msg.channel_id,
          userId: msg.user_id,
          userName: msg.users.name,
          content: msg.content,
          createdAt: new Date(msg.created_at),
          updatedAt: new Date(msg.updated_at),
          deletedAt: msg.deleted_at ? new Date(msg.deleted_at) : null
        }))

        setMessages(formattedMessages)
        logInfo('Messages loaded successfully', { count: messages.length })
      } catch (error) {
        logError(error as Error, 'MessageProvider.loadMessages')
      }
    }

    void loadMessages()

    // Subscribe to message updates
    const messageSubscription = supabase
      .channel(`messages:${activeChannel.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `channel_id=eq.${activeChannel.id}`
      }, payload => {
        logInfo('Message update received', { payload })
        void loadMessages() // Reload messages on any change
      })
      .subscribe()

    logMethodExit('MessageProvider.loadMessagesEffect')
    return () => {
      void messageSubscription.unsubscribe()
    }
  }, [activeChannel?.id, user?.id])

  const sendMessage = useCallback(async (content: string): Promise<Message> => {
    logMethodEntry('sendMessage', { content })
    if (!user || !activeChannel) {
      const error = new Error('Cannot send message: no active user or channel')
      logError(error, 'sendMessage')
      throw error
    }

    try {
      const messageData = toDbFields({
        channelId: activeChannel.id,
        userId: user.id,
        content
      })

      const { data: dbMessage, error } = await supabase
        .from('messages')
        .insert([messageData])
        .select(`
          id,
          channel_id,
          user_id,
          content,
          created_at,
          updated_at,
          deleted_at,
          users:user_id (
            name
          )
        `)
        .single()

      if (error) {
        logError(error, 'sendMessage')
        throw error
      }

      if (!dbMessage) {
        const error = new Error('Failed to create message')
        logError(error, 'sendMessage')
        throw error
      }

      const newMessage: Message = {
        id: dbMessage.id,
        channelId: dbMessage.channel_id,
        userId: dbMessage.user_id,
        userName: dbMessage.users.name,
        content: dbMessage.content,
        createdAt: new Date(dbMessage.created_at),
        updatedAt: new Date(dbMessage.updated_at),
        deletedAt: dbMessage.deleted_at ? new Date(dbMessage.deleted_at) : null
      }

      setMessages(prev => [...prev, newMessage])
      logMethodExit('sendMessage', { message: newMessage })
      return newMessage
    } catch (error) {
      logError(error instanceof Error ? error : new Error('Failed to send message'), 'sendMessage')
      throw error
    }
  }, [user, activeChannel])

  const editMessage = useCallback(async (messageId: string, content: string): Promise<void> => {
    logMethodEntry('editMessage', { messageId, content })
    if (!user) {
      const error = new Error('Cannot edit message: no active user')
      logError(error, 'editMessage')
      throw error
    }

    try {
      const messageData = toDbFields({
        content,
        updatedAt: new Date().toISOString()
      })

      const { error } = await supabase
        .from('messages')
        .update(messageData)
        .eq('id', messageId)
        .eq('user_id', user.id)

      if (error) {
        logError(error, 'editMessage')
        throw error
      }

      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content, updatedAt: new Date() }
          : msg
      ))

      logMethodExit('editMessage')
    } catch (error) {
      logError(error instanceof Error ? error : new Error('Failed to edit message'), 'editMessage')
      throw error
    }
  }, [user])

  const deleteMessage = useCallback(async (messageId: string): Promise<void> => {
    logMethodEntry('deleteMessage', { messageId })
    if (!user) {
      const error = new Error('Cannot delete message: no active user')
      logError(error, 'deleteMessage')
      throw error
    }

    try {
      const messageData = toDbFields({
        deletedAt: new Date().toISOString()
      })

      const { error } = await supabase
        .from('messages')
        .update(messageData)
        .eq('id', messageId)
        .eq('user_id', user.id)

      if (error) {
        logError(error, 'deleteMessage')
        throw error
      }

      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, deletedAt: new Date() }
          : msg
      ))

      logMethodExit('deleteMessage')
    } catch (error) {
      logError(error instanceof Error ? error : new Error('Failed to delete message'), 'deleteMessage')
      throw error
    }
  }, [user])

  const value = {
    messages,
    sendMessage,
    editMessage,
    deleteMessage
  }

  const result = (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  )

  logMethodExit('MessageProvider')
  return result
}

export function useMessages(): MessageContextType {
  const context = useContext(MessageContext)
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider')
  }
  return context
} 