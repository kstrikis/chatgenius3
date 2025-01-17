import React, { useEffect, useState, useCallback } from 'react'
import { logMethodEntry, logMethodExit, logError, logInfo, logWarning } from '../lib/logger'
import { subscribeToUsers, unsubscribe, supabase } from '../lib/supabase'
import type { RealtimeChangePayload } from '../lib/supabase'
import { getAllUsers } from '../lib/supabaseTest'
import type { User } from '../types/database'

export function UserList(): React.ReactElement {
  logMethodEntry('UserList')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string>('')

  // Handler for real-time updates
  const handleRealtimeUpdate = useCallback((payload: RealtimeChangePayload): void => {
    logMethodEntry('UserList.handleRealtimeUpdate', { payload })
    setLastUpdate(new Date().toISOString())
    
    switch (payload.eventType) {
      case 'INSERT':
        setUsers(prev => {
          // Check if user already exists
          if (prev.some(user => user.id === payload.new.id)) {
            logInfo('User already exists, skipping insert', { userId: payload.new.id })
            return prev
          }
          logInfo('Adding new user to list', { user: payload.new })
          return [...prev, payload.new]
        })
        break
        
      case 'DELETE':
        setUsers(prev => {
          logInfo('Removing user from list', { userId: payload.old.id })
          return prev.filter(user => user.id !== payload.old.id)
        })
        break
        
      case 'UPDATE':
        setUsers(prev => {
          logInfo('Updating user in list', { user: payload.new })
          return prev.map(user => 
            user.id === payload.new.id ? payload.new : user
          )
        })
        break
        
      default:
        logWarning('Unknown event type', { eventType: payload.eventType })
    }
    logMethodExit('UserList.handleRealtimeUpdate')
  }, [])

  useEffect((): (() => void) => {
    logMethodEntry('UserList.useEffect')
    let mounted = true

    const loadUsers = async (): Promise<void> => {
      logMethodEntry('UserList.loadUsers')
      try {
        logInfo('Loading users...')
        const loadedUsers = await getAllUsers()
        logInfo('Users loaded successfully', { count: loadedUsers.length })
        if (mounted) {
          setUsers(loadedUsers)
          setError(null)
        }
      } catch (err) {
        logError(err instanceof Error ? err : new Error('Failed to load users'), 'UserList.loadUsers')
        if (mounted) {
          setError('Failed to load users')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
        logMethodExit('UserList.loadUsers')
      }
    }

    // Set up real-time subscription
    logInfo('Setting up real-time subscription')
    const channel = subscribeToUsers(handleRealtimeUpdate)

    // Load initial data
    void loadUsers()

    // Cleanup subscription and prevent memory leaks
    return () => {
      logMethodEntry('UserList.useEffect.cleanup')
      mounted = false
      unsubscribe(channel)
      logMethodExit('UserList.useEffect.cleanup')
    }
  }, [handleRealtimeUpdate])

  const handleDelete = async (userId: number): Promise<void> => {
    logMethodEntry('UserList.handleDelete', { userId })
    try {
      logInfo('Deleting user', { userId })
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (deleteError) {
        throw deleteError
      }
      logInfo('User deleted successfully', { userId })
    } catch (err) {
      logError(err instanceof Error ? err : new Error('Failed to delete user'), 'UserList.handleDelete')
      setError('Failed to delete user')
    }
    logMethodExit('UserList.handleDelete')
  }

  let result: React.ReactElement
  if (loading) {
    result = <div className="user-list">Loading users...</div>
  } else if (error) {
    result = (
      <div className="user-list">
        <div className="error">
          {error}
          <button onClick={(): void => window.location.reload()}>Retry</button>
        </div>
      </div>
    )
  } else {
    result = (
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
                  className="delete-button"
                  onClick={(): Promise<void> => handleDelete(user.id)}
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

  logMethodExit('UserList')
  return result
} 