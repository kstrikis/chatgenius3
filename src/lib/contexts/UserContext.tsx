import React, { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import { logMethodEntry, logMethodExit, logInfo, logError } from '@/lib/logger'
import { findOrCreateUser, updateUserStatus, generateAnonymousName, type DbUser } from '@/lib/supabase'

const USER_STORAGE_KEY = 'chatgenius_user'
const PERSIST_DEBOUNCE_MS = 1000 // 1 second debounce for persistence

export interface User {
  id?: string
  name: string
  isGuest: boolean
  status: 'online' | 'away' | 'offline'
}

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  isAuthenticated: boolean
  login: (name?: string) => Promise<void>
  logout: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

interface UserProviderProps {
  children: ReactNode
}

export function UserProvider({ children }: UserProviderProps): React.ReactElement {
  logMethodEntry('UserProvider')
  const [user, setUser] = useState<User | null>(() => {
    logMethodEntry('UserProvider.initializeState')
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY)
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser) as User
        logInfo('Restored user from storage', { user: parsedUser })
        return parsedUser
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to parse stored user')
      logError(error, 'UserProvider.initializeState')
      localStorage.removeItem(USER_STORAGE_KEY)
    }
    logMethodExit('UserProvider.initializeState', { result: 'no stored user' })
    return null
  })

  // Keep track of the last persisted user state
  const lastPersistedRef = useRef<string | null>(null)

  // Debounced persistence function
  const debouncedPersist = useCallback((newUser: User | null): void => {
    const newState = newUser ? JSON.stringify(newUser) : null
    // Only persist if the state has actually changed
    if (newState !== lastPersistedRef.current) {
      lastPersistedRef.current = newState
      if (newUser) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser))
        logInfo('Persisted user to storage', { user: newUser })
      } else {
        localStorage.removeItem(USER_STORAGE_KEY)
        logInfo('Removed user from storage')
      }
    }
  }, [])

  // Persist user state to localStorage with debounce
  useEffect(() => {
    logMethodEntry('UserProvider.persistEffect')
    const timeoutId = setTimeout(() => {
      debouncedPersist(user)
    }, PERSIST_DEBOUNCE_MS)
    
    logMethodExit('UserProvider.persistEffect')
    return () => clearTimeout(timeoutId)
  }, [user, debouncedPersist])

  // Update online status when window focus changes
  useEffect(() => {
    logMethodEntry('UserProvider.focusEffect')
    let focusTimeoutId: NodeJS.Timeout
    let blurTimeoutId: NodeJS.Timeout

    const handleFocus = async (): Promise<void> => {
      // Clear any pending blur timeout
      clearTimeout(blurTimeoutId)
      
      // Wait a bit before marking as online to avoid rapid status changes
      focusTimeoutId = setTimeout(async () => {
        if (user?.id && user.status !== 'online') {
          try {
            await updateUserStatus(user.id, 'online')
            setUser({ ...user, status: 'online' })
          } catch (error) {
            logError(error as Error, 'UserProvider.handleFocus')
          }
        }
      }, 2000) // 2 second delay
    }

    const handleBlur = async (): Promise<void> => {
      // Clear any pending focus timeout
      clearTimeout(focusTimeoutId)
      
      // Wait a bit before marking as away to avoid rapid status changes
      blurTimeoutId = setTimeout(async () => {
        if (user?.id && user.status !== 'away') {
          try {
            await updateUserStatus(user.id, 'away')
            setUser({ ...user, status: 'away' })
          } catch (error) {
            logError(error as Error, 'UserProvider.handleBlur')
          }
        }
      }, 5000) // 5 second delay
    }

    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)

    // Set initial status
    if (user?.id && document.hasFocus()) {
      void handleFocus()
    }

    logMethodExit('UserProvider.focusEffect')
    return (): void => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
      clearTimeout(focusTimeoutId)
      clearTimeout(blurTimeoutId)
    }
  }, [user])

  const login = async (name?: string): Promise<void> => {
    logMethodEntry('UserProvider.login', { name })
    try {
      const userName = name || generateAnonymousName()
      const dbUser = await findOrCreateUser(userName)
      setUser({
        id: dbUser.id,
        name: dbUser.name,
        isGuest: dbUser.isGuest,
        status: dbUser.status
      })
      logInfo('User logged in successfully', { userName })
    } catch (error) {
      logError(error as Error, 'UserProvider.login')
      throw error
    }
    logMethodExit('UserProvider.login')
  }

  const logout = async (): Promise<void> => {
    logMethodEntry('UserProvider.logout')
    try {
      if (user?.id) {
        await updateUserStatus(user.id, 'offline')
      }
      setUser(null)
      logInfo('User logged out successfully')
    } catch (error) {
      logError(error as Error, 'UserProvider.logout')
      throw error
    }
    logMethodExit('UserProvider.logout')
  }

  const value = {
    user,
    setUser,
    isAuthenticated: !!user,
    login,
    logout
  }

  const result = (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )

  logMethodExit('UserProvider')
  return result
}

export function useUser(): UserContextType {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
} 