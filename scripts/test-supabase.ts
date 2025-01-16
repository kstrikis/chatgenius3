import { supabase } from '../src/lib/supabase'
import { testRealtimeUpdates } from '../src/lib/supabaseRealtimeTest'
import { testUserOperations } from '../src/lib/supabaseTest'

async function verifyConnection() {
  console.log('Verifying Supabase connection...')
  const { count, error } = await supabase
    .from('users')
    .select('count', { count: 'exact' })

  if (error) {
    throw new Error(`Failed to connect to Supabase: ${error.message}`)
  }

  console.log('Successfully connected to Supabase')
  console.log('Current user count:', count)
}

async function main() {
  try {
    // Verify connection first
    await verifyConnection()

    console.log('\n-------------------\n')
    
    // Test basic CRUD operations
    await testUserOperations()
    
    console.log('\n-------------------\n')
    
    // Test real-time updates
    await testRealtimeUpdates()
  } catch (error) {
    console.error('Test failed:', error)
    process.exit(1)
  }
}

main() 