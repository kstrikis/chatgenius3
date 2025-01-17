import { createClient } from '@supabase/supabase-js'
import { logError, logInfo, logMethodEntry, logMethodExit } from '@/lib/logger'
import { toDbFields, fromDbFields } from '@/lib/utils/db'

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

// Convert database row to application interface
function mapDbRowToUser(row: Record<string, unknown>): DbUser {
  return fromDbFields<DbUser>(row)
}

export async function findOrCreateUser(name: string): Promise<DbUser> {
  logMethodEntry('findOrCreateUser', { name })
  try {
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('name', name)
      .single()

    if (findError && findError.code !== 'PGRST116') {
      throw findError
    }

    if (existingUser) {
      logMethodExit('findOrCreateUser', { existingUser })
      return mapDbRowToUser(existingUser)
    }

    const newUserData = {
      name,
      isGuest: true,
      status: 'online' as const
    }

    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([toDbFields(newUserData)])
      .select()
      .single()

    if (createError) {
      throw createError
    }

    // Join the general channel
    const channelMemberData = {
      channelId: 'c0d46316-9e1d-4e8b-a7e7-b0a46c17c58c',
      userId: newUser.id
    }

    const { error: joinError } = await supabase
      .from('channel_members')
      .insert([toDbFields(channelMemberData)])

    if (joinError) {
      throw joinError
    }

    logMethodExit('findOrCreateUser', { newUser })
    return mapDbRowToUser(newUser)
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
    const updateData = {
      status,
      lastSeen: new Date().toISOString()
    }

    const { error } = await supabase
      .from('users')
      .update(toDbFields(updateData))
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