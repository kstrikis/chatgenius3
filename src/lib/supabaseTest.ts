import type { NewUser, User } from '../types/database'

import { supabase } from './supabase'

export async function createUser(user: NewUser): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .insert([user])
    .select()
    .single()

  if (error) {
    console.error('Error creating user:', error)
    return null
  }

  return data
}

export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching users:', error)
    return []
  }

  return data
}

export async function getUserById(id: number): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching user:', error)
    return null
  }

  return data
}

// Test function to demonstrate usage
export async function testUserOperations() {
  console.log('Testing Supabase User Operations...')

  // Create a new user
  const newUser: NewUser = {
    name: 'Test User',
    email: 'test@example.com'
  }

  console.log('Creating new user...')
  const createdUser = await createUser(newUser)
  console.log('Created user:', createdUser)

  if (createdUser) {
    // Fetch the user by ID
    console.log('Fetching user by ID...')
    const fetchedUser = await getUserById(createdUser.id)
    console.log('Fetched user:', fetchedUser)
  }

  // Fetch all users
  console.log('Fetching all users...')
  const allUsers = await getAllUsers()
  console.log('All users:', allUsers)
} 