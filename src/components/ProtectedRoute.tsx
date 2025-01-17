import React from 'react'
import { Navigate } from 'react-router-dom'
import { useUser } from '@/lib/contexts/UserContext'
import { logMethodEntry, logMethodExit, logInfo } from '@/lib/logger'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps): React.ReactElement {
  logMethodEntry('ProtectedRoute')
  const { isAuthenticated, isLoading } = useUser()

  if (isLoading) {
    logInfo('ProtectedRoute: Loading user state')
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    logInfo('ProtectedRoute: User not authenticated, redirecting to login')
    return <Navigate to="/" replace />
  }

  logMethodExit('ProtectedRoute')
  return <>{children}</>
} 