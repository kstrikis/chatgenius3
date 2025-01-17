import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { logMethodEntry, logMethodExit, logInfo, logError } from '@/lib/logger'
import { useUser } from './UserContext'
import { useChat } from './ChatContext'
import { supabase } from '@/lib/supabase'
import { fromDbFields } from '@/lib/utils/db'

export interface ChannelUser {
  id: string
  name: string
  isGuest: boolean
  status: 'online' | 'away' | 'offline'
  lastSeen: string
}

interface ChannelUsersContextType {
  users: ChannelUser[]
  isLoading: boolean
  error: string | null
}

const ChannelUsersContext = createContext<ChannelUsersContextType | undefined>(undefined)

interface ChannelUsersProviderProps {
  children: ReactNode
}

export function ChannelUsersProvider({ children }: ChannelUsersProviderProps): React.ReactElement {
  logMethodEntry('ChannelUsersProvider')
  const { user } = useUser()
  const { activeChannel } = useChat()
  const [users, setUsers] = useState<ChannelUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load users for the active channel
  useEffect(() => {
    logMethodEntry('ChannelUsersProvider.loadUsersEffect')
    if (!activeChannel?.id || !user?.id) {
      setUsers([])
      setIsLoading(false)
      logMethodExit('ChannelUsersProvider.loadUsersEffect', { reason: 'no active channel or user' })
      return
    }

    const loadUsers = async (): Promise<void> => {
      try {
        const { data: channelUsers, error: usersError } = await supabase
          .from('channel_members')
          .select(`
            users (
              id,
              name,
              is_guest,
              status,
              last_seen
            )
          `)
          .eq('channel_id', activeChannel.id)

        if (usersError) throw usersError

        const formattedUsers = channelUsers
          .filter(member => member.users)
          .map(member => fromDbFields<ChannelUser>(member.users as unknown as Record<string, unknown>))
        setUsers(formattedUsers)
        setError(null)
        logInfo('Channel users loaded successfully', { count: formattedUsers.length })
      } catch (error) {
        logError(error as Error, 'ChannelUsersProvider.loadUsers')
        setError('Failed to load channel users')
      } finally {
        setIsLoading(false)
      }
    }

    void loadUsers()

    // Subscribe to user status changes
    const userSubscription = supabase
      .channel('public:users')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'users'
      }, payload => {
        logInfo('User update received', { payload })
        void loadUsers() // Reload users on any change
      })
      .subscribe()

    // Subscribe to channel member changes
    const memberSubscription = supabase
      .channel(`channel_members:${activeChannel.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'channel_members',
        filter: `channel_id=eq.${activeChannel.id}`
      }, payload => {
        logInfo('Channel member update received', { payload })
        void loadUsers() // Reload users on any change
      })
      .subscribe()

    logMethodExit('ChannelUsersProvider.loadUsersEffect')
    return () => {
      void userSubscription.unsubscribe()
      void memberSubscription.unsubscribe()
    }
  }, [activeChannel?.id, user?.id])

  const value = {
    users,
    isLoading,
    error
  }

  const result = (
    <ChannelUsersContext.Provider value={value}>
      {children}
    </ChannelUsersContext.Provider>
  )

  logMethodExit('ChannelUsersProvider')
  return result
}

export function useChannelUsers(): ChannelUsersContextType {
  const context = useContext(ChannelUsersContext)
  if (context === undefined) {
    throw new Error('useChannelUsers must be used within a ChannelUsersProvider')
  }
  return context
} 