import type { RealtimeChannel } from '@supabase/supabase-js'

import { subscribeToUsers, unsubscribe, type RealtimeChangePayload } from './supabase'
import { createUser } from './supabaseTest'

export async function testRealtimeUpdates() {
  console.log('Testing Supabase Realtime Updates...')
  
  // Set up realtime subscription
  const channel: RealtimeChannel = subscribeToUsers((payload: RealtimeChangePayload) => {
    console.log('Received real-time update:', {
      event: payload.eventType,
      table: payload.table,
      schema: payload.schema,
      data: payload.new || payload.old
    })
  })

  // Create a new user to trigger a real-time event
  console.log('Creating a new user to trigger real-time event...')
  await createUser({
    name: 'Realtime Test User',
    email: 'realtime@example.com'
  })

  // Keep the connection open for a few seconds to receive the event
  console.log('Waiting for real-time events...')
  await new Promise(resolve => setTimeout(resolve, 5000))

  // Clean up
  console.log('Cleaning up subscription...')
  unsubscribe(channel)
} 