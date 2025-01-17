import { subscribeToUsers, unsubscribe } from './supabase'
import { logMethodEntry, logMethodExit, logInfo } from './logger'
import type { RealtimeChangePayload } from './supabase'

// Test function to demonstrate real-time subscription
export async function testRealtimeUpdates(): Promise<void> {
  logMethodEntry('testRealtimeUpdates')
  
  // Set up handler for real-time updates
  const handleUpdate = (payload: RealtimeChangePayload): void => {
    logMethodEntry('testRealtimeUpdates.handleUpdate', { payload })
    logInfo('Received real-time update', { 
      eventType: payload.eventType,
      new: payload.new,
      old: payload.old 
    })
    logMethodExit('testRealtimeUpdates.handleUpdate')
  }

  // Subscribe to changes
  logInfo('Setting up real-time subscription')
  const channel = subscribeToUsers(handleUpdate)

  // Wait for a while to receive updates
  await new Promise(resolve => setTimeout(resolve, 10000))

  // Clean up subscription
  logInfo('Cleaning up subscription')
  unsubscribe(channel)

  logMethodExit('testRealtimeUpdates')
} 