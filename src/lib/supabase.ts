import { createClient } from '@supabase/supabase-js'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { logMethodEntry, logMethodExit, logError, logInfo } from './logger'
import type { User } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

logInfo('Initializing Supabase client', { url: supabaseUrl })
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE'

export type RealtimeChangePayload = {
  eventType: RealtimeEventType
  new: User
  old: User
  table: string
  schema: string
}

export function subscribeToUsers(
  callback: (payload: RealtimeChangePayload) => void
): RealtimeChannel {
  logMethodEntry('subscribeToUsers')
  logInfo('Setting up users subscription')

  const channel = supabase.channel('db-changes')

  channel
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'users'
      },
      (payload) => {
        logMethodEntry('subscribeToUsers.onPayload')
        logInfo('Raw payload received', { payload })
        try {
          const typedPayload: RealtimeChangePayload = {
            eventType: payload.eventType as RealtimeEventType,
            new: payload.new as User,
            old: payload.old as User,
            table: payload.table,
            schema: payload.schema
          }
          logInfo('Processed payload', { typedPayload })
          callback(typedPayload)
        } catch (error) {
          logError(error instanceof Error ? error : new Error('Error processing payload'), 'subscribeToUsers.onPayload')
        }
        logMethodExit('subscribeToUsers.onPayload')
      }
    )
    .subscribe((status) => {
      logMethodEntry('subscribeToUsers.onSubscribe')
      logInfo('Realtime subscription status updated', { status })
      if (status === 'SUBSCRIBED') {
        logInfo('Successfully subscribed to real-time changes')
      }
      logMethodExit('subscribeToUsers.onSubscribe')
    })

  logMethodExit('subscribeToUsers')
  return channel
}

// Helper to unsubscribe from real-time updates
export function unsubscribe(channel: RealtimeChannel): void {
  logMethodEntry('unsubscribe', { topic: channel.topic })
  void supabase.removeChannel(channel)
  logMethodExit('unsubscribe')
} 