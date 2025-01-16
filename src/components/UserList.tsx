import { useEffect, useState, useCallback } from 'react'

import { subscribeToUsers, unsubscribe, supabase } from '../lib/supabase'
import type { RealtimeChangePayload } from '../lib/supabase'
import { getAllUsers } from '../lib/supabaseTest'
import type { User } from '../types/database'

export function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string>('')

  // Handler for real-time updates
  const handleRealtimeUpdate = useCallback((payload: RealtimeChangePayload) => {
    console.log('Handling real-time update:', payload)
    setLastUpdate(new Date().toISOString())
    
    switch (payload.eventType) {
      case 'INSERT':
        setUsers(prev => {
          // Check if user already exists
          if (prev.some(user => user.id === payload.new.id)) {
            console.log('User already exists, skipping insert')
            return prev
          }
          console.log('Adding new user to list')
          return [...prev, payload.new]
        })
        break
        
      case 'DELETE':
        setUsers(prev => {
          console.log('Removing user from list')
          return prev.filter(user => user.id !== payload.old.id)
        })
        break
        
      case 'UPDATE':
        setUsers(prev => {
          console.log('Updating user in list')
          return prev.map(user => 
            user.id === payload.new.id ? payload.new : user
          )
        })
        break
        
      default:
        console.warn('Unknown event type:', payload.eventType)
    }
  }, [])

  useEffect(() => {
    console.log('UserList component mounted')
    let mounted = true

    const loadUsers = async () => {
      try {
        console.log('Loading users...')
        const loadedUsers = await getAllUsers()
        console.log('Loaded users:', loadedUsers)
        if (mounted) {
          setUsers(loadedUsers)
          setError(null)
        }
      } catch (err) {
        console.error('Error in loadUsers:', err)
        if (mounted) {
          setError('Failed to load users')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // Set up real-time subscription
    console.log('Setting up real-time subscription...')
    const channel = subscribeToUsers(handleRealtimeUpdate)

    // Load initial data
    loadUsers()

    // Cleanup subscription and prevent memory leaks
    return () => {
      console.log('UserList component unmounting')
      mounted = false
      unsubscribe(channel)
    }
  }, [handleRealtimeUpdate])

  const handleDelete = async (userId: number) => {
    try {
      console.log('Deleting user:', userId)
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (deleteError) throw deleteError
      console.log('User deleted successfully:', userId)
    } catch (err) {
      console.error('Error in handleDelete:', err)
      setError('Failed to delete user')
    }
  }

  if (loading) {
    return <div className="user-list">Loading users...</div>
  }

  if (error) {
    return (
      <div className="user-list">
        <div className="error">
          {error}
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="user-list">
      <h2>Users ({users.length})</h2>
      {lastUpdate && (
        <div className="last-update">
          Last update: {new Date(lastUpdate).toLocaleTimeString()}
        </div>
      )}
      {users.length === 0 ? (
        <p>No users found</p>
      ) : (
        <ul>
          {users.map(user => (
            <li key={user.id} className="user-item">
              <div className="user-info">
                <strong>{user.name}</strong> ({user.email})
              </div>
              <button
                onClick={() => handleDelete(user.id)}
                className="delete-button"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
} 