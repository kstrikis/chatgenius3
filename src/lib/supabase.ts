import { createClient } from '@supabase/supabase-js'
import { logError, logInfo } from '@/lib/logger'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

logInfo('Initializing Supabase client', { url: supabaseUrl })
export const supabase = createClient(supabaseUrl, supabaseKey)

const ANIMAL_NAMES = [
  'Aardvark', 'Bear', 'Cheetah', 'Dolphin', 'Elephant',
  'Fox', 'Giraffe', 'Hippo', 'Iguana', 'Jaguar',
  'Kangaroo', 'Lion', 'Monkey', 'Narwhal', 'Octopus',
  'Penguin', 'Quokka', 'Raccoon', 'Sloth', 'Tiger',
  'Unicorn', 'Vulture', 'Walrus', 'Xenops', 'Yak',
  'Zebra'
]

export function generateAnonymousName(): string {
  const randomAnimal = ANIMAL_NAMES[Math.floor(Math.random() * ANIMAL_NAMES.length)]
  return `Anonymous ${randomAnimal}`
}

// Interface for our application code (camelCase)
export interface DbUser {
  id: string
  name: string
  isGuest: boolean
  status: 'online' | 'away' | 'offline'
  createdAt: string
  lastSeen: string
}

// Interface for database operations (snake_case)
interface DbUserRow {
  id: string
  name: string
  is_guest: boolean
  status: 'online' | 'away' | 'offline'
  created_at: string
  last_seen: string
}

// Convert database row to application interface
function mapDbRowToUser(row: DbUserRow): DbUser {
  return {
    id: row.id,
    name: row.name,
    isGuest: row.is_guest,
    status: row.status,
    createdAt: row.created_at,
    lastSeen: row.last_seen
  }
}

export async function findOrCreateUser(name: string): Promise<DbUser> {
  try {
    // First try to find an existing guest user with this name
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select()
      .eq('name', name)
      .eq('is_guest', true)
      .single()

    if (findError && findError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw findError
    }

    if (existingUser) {
      return mapDbRowToUser(existingUser as DbUserRow)
    }

    // If no existing user, create a new one
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          name,
          is_guest: true,
          status: 'online',
          last_seen: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    return mapDbRowToUser(newUser as DbUserRow)
  } catch (error) {
    logError(error as Error, 'findOrCreateUser')
    throw error
  }
}

export async function updateUserStatus(
  userId: string,
  status: 'online' | 'away' | 'offline'
): Promise<void> {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        status,
        last_seen: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      throw error
    }
  } catch (error) {
    logError(error as Error, 'updateUserStatus')
    throw error
  }
}

export interface RealtimeChangePayload<T = any> {
  new: T | null
  old: T | null
  errors: any[] | null
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
}

export function subscribeToUsers(callback: (payload: RealtimeChangePayload) => void): { unsubscribe: () => void } {
  const subscription = supabase
    .channel('public:users')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public',
      table: 'users'
    }, callback)
    .subscribe()

  return subscription
}

export const unsubscribe = (subscription: { unsubscribe: () => void }): void => {
  void subscription.unsubscribe()
} 