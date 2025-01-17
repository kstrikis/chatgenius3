import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { logMethodEntry, logMethodExit, logInfo, logError } from '@/lib/logger'
import { useUser } from './UserContext'
import { supabase } from '@/lib/supabase'
import { toDbFields } from '@/lib/utils/db'

export interface Channel {
  id: string
  name: string
  description?: string
  type: 'public' | 'private'
  unreadCount: number
  createdAt: Date
  updatedAt: Date
}

interface DbChannel {
  id: string
  name: string
  description: string | null
  type: 'public' | 'private'
  created_at: string
  updated_at: string
}

interface ChatContextType {
  activeChannel: Channel | null
  channels: Channel[]
  setActiveChannel: (channel: Channel | null) => void
  createChannel: (name: string, description?: string) => Promise<Channel>
  joinChannel: (channelId: string) => Promise<void>
  leaveChannel: (channelId: string) => Promise<void>
  markChannelAsRead: (channelId: string) => Promise<void>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

interface ChatProviderProps {
  children: ReactNode
}

export function ChatProvider({ children }: ChatProviderProps): React.ReactElement {
  logMethodEntry('ChatProvider')
  const { user } = useUser()
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null)
  const [channels, setChannels] = useState<Channel[]>([])

  // Load channels for the current user
  useEffect(() => {
    logMethodEntry('ChatProvider.loadChannelsEffect')
    if (!user?.id) {
      setChannels([])
      setActiveChannel(null)
      logMethodExit('ChatProvider.loadChannelsEffect', { reason: 'no user' })
      return
    }

    const loadChannels = async (): Promise<void> => {
      try {
        const { data: channelMembers, error: membersError } = await supabase
          .from('channel_members')
          .select('channel_id')
          .eq('user_id', user.id)

        if (membersError) throw membersError

        const channelIds = channelMembers.map(member => member.channel_id)
        
        const { data: channelsData, error: channelsError } = await supabase
          .from('channels')
          .select('*')
          .in('id', channelIds)
          .order('name')

        if (channelsError) throw channelsError

        const formattedChannels: Channel[] = (channelsData as DbChannel[]).map(channel => ({
          id: channel.id,
          name: channel.name,
          description: channel.description ?? undefined,
          type: channel.type,
          unreadCount: 0, // TODO: Implement unread count
          createdAt: new Date(channel.created_at),
          updatedAt: new Date(channel.updated_at)
        }))

        setChannels(formattedChannels)
        logInfo('Channels loaded successfully', { count: formattedChannels.length })
      } catch (error) {
        logError(error as Error, 'ChatProvider.loadChannelsEffect')
      }
    }

    void loadChannels()
    
    // Subscribe to channel updates
    const channelSubscription = supabase
      .channel('public:channels')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'channels'
      }, payload => {
        logInfo('Channel update received', { payload })
        void loadChannels() // Reload channels on any change
      })
      .subscribe()

    logMethodExit('ChatProvider.loadChannelsEffect')
    return () => {
      void channelSubscription.unsubscribe()
    }
  }, [user?.id])

  const createChannel = useCallback(async (name: string, description?: string): Promise<Channel> => {
    logMethodEntry('ChatProvider.createChannel', { name, description })
    if (!user?.id) {
      const error = new Error('Cannot create channel: No user logged in')
      logError(error, 'ChatProvider.createChannel')
      throw error
    }

    try {
      // Create the channel
      const { data: channelData, error: channelError } = await supabase
        .from('channels')
        .insert([
          { name, description, type: 'public' }
        ])
        .select()
        .single()

      if (channelError) throw channelError
      if (!channelData) throw new Error('No channel data returned')

      // Add the creator as a member
      const { error: memberError } = await supabase
        .from('channel_members')
        .insert([
          toDbFields({
            channelId: channelData.id,
            userId: user.id
          })
        ])

      if (memberError) throw memberError

      const dbChannel = channelData as DbChannel
      const newChannel: Channel = {
        id: dbChannel.id,
        name: dbChannel.name,
        description: dbChannel.description ?? undefined,
        type: dbChannel.type,
        unreadCount: 0,
        createdAt: new Date(dbChannel.created_at),
        updatedAt: new Date(dbChannel.updated_at)
      }

      logInfo('Channel created successfully', { channel: newChannel })
      return newChannel
    } catch (error) {
      logError(error as Error, 'ChatProvider.createChannel')
      throw error
    }
  }, [user?.id])

  const joinChannel = useCallback(async (channelId: string): Promise<void> => {
    logMethodEntry('ChatProvider.joinChannel', { channelId })
    if (!user?.id) {
      const error = new Error('Cannot join channel: No user logged in')
      logError(error, 'ChatProvider.joinChannel')
      throw error
    }

    try {
      const { error } = await supabase
        .from('channel_members')
        .insert([
          toDbFields({
            channelId,
            userId: user.id
          })
        ])

      if (error) throw error
      logInfo('Channel joined successfully', { channelId })
    } catch (error) {
      logError(error as Error, 'ChatProvider.joinChannel')
      throw error
    }
  }, [user?.id])

  const leaveChannel = useCallback(async (channelId: string): Promise<void> => {
    logMethodEntry('ChatProvider.leaveChannel', { channelId })
    if (!user?.id) {
      const error = new Error('Cannot leave channel: No user logged in')
      logError(error, 'ChatProvider.leaveChannel')
      throw error
    }

    try {
      const { error } = await supabase
        .from('channel_members')
        .delete()
        .eq('channel_id', channelId)
        .eq('user_id', user.id)

      if (error) throw error

      if (activeChannel?.id === channelId) {
        setActiveChannel(null)
      }

      logInfo('Channel left successfully', { channelId })
    } catch (error) {
      logError(error as Error, 'ChatProvider.leaveChannel')
      throw error
    }
  }, [user?.id, activeChannel])

  const markChannelAsRead = useCallback(async (channelId: string): Promise<void> => {
    logMethodEntry('ChatProvider.markChannelAsRead', { channelId })
    // TODO: Implement mark as read functionality when messages are implemented
    logMethodExit('ChatProvider.markChannelAsRead')
  }, [])

  const value = {
    activeChannel,
    channels,
    setActiveChannel,
    createChannel,
    joinChannel,
    leaveChannel,
    markChannelAsRead
  }

  const result = (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )

  logMethodExit('ChatProvider')
  return result
}

export function useChat(): ChatContextType {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
} 