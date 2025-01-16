import { createClient } from '@supabase/supabase-js'
import type { RealtimeChannel } from '@supabase/supabase-js'

import type { User } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

console.log('Initializing Supabase client with URL:', supabaseUrl)
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

export interface RealtimeChangePayload {
  eventType: RealtimeEventType
  new: User
  old: User
  table: string
  schema: string
}

export function subscribeToUsers(
  callback: (payload: RealtimeChangePayload) => void
): RealtimeChannel {
  console.log('Setting up users subscription for component')

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
        console.log('Raw payload received:', payload)
        try {
          const typedPayload: RealtimeChangePayload = {
            eventType: payload.eventType as RealtimeEventType,
            new: payload.new as User,
            old: payload.old as User,
            table: payload.table,
            schema: payload.schema
          }
          console.log('Processed payload:', typedPayload)
          callback(typedPayload)
        } catch (error) {
          console.error('Error processing payload:', error)
        }
      }
    )
    .subscribe((status) => {
      console.log(`Realtime subscription status: ${status}`)
      if (status === 'SUBSCRIBED') {
        console.log('Successfully subscribed to real-time changes')
      }
    })

  return channel
}

// Helper to unsubscribe from real-time updates
export function unsubscribe(channel: RealtimeChannel) {
  console.log('Unsubscribing from channel:', channel.topic)
  supabase.removeChannel(channel)
} 