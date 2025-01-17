import { supabase } from './supabase'
import type { User } from '../types/database'
import { logMethodEntry, logMethodExit, logInfo, logError } from './logger'

export async function getAllUsers(): Promise<User[]> {
  logMethodEntry('getAllUsers')
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      logError(error, 'getAllUsers')
      throw error
    }

    logInfo('Successfully fetched users', { count: data?.length })
    logMethodExit('getAllUsers', { count: data?.length })
    return data || []
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Failed to fetch users'), 'getAllUsers')
    throw error
  }
}

export async function createUser(user: Omit<User, 'id' | 'created_at'>): Promise<User | null> {
  logMethodEntry('createUser', { user })
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single()

    if (error) {
      logError(error, 'createUser')
      throw error
    }

    logInfo('Successfully created user', { user: data })
    logMethodExit('createUser', { user: data })
    return data
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Failed to create user'), 'createUser')
    throw error
  }
}

export async function testUserOperations(): Promise<void> {
  logMethodEntry('testUserOperations')
  try {
    // Test creating a user
    const newUser = await createUser({
      name: 'Test User',
      email: 'test@example.com'
    })
    logInfo('Created test user', { user: newUser })

    // Test fetching users
    const users = await getAllUsers()
    logInfo('Fetched all users', { count: users.length })

    // Test deleting the test user if it was created
    if (newUser) {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', newUser.id)

      if (error) {
        logError(error, 'testUserOperations.deleteUser')
      } else {
        logInfo('Deleted test user', { userId: newUser.id })
      }
    }

    logMethodExit('testUserOperations', { success: true })
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Test operations failed'), 'testUserOperations')
    logMethodExit('testUserOperations', { success: false, error })
    throw error
  }
} 