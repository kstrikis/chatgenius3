import React from 'react'
import { logMethodEntry, logMethodExit } from '@/lib/logger'
import { useUser } from '@/lib/contexts/UserContext'
import { Navigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function ChatPage(): React.ReactElement {
  logMethodEntry('ChatPage')
  const { user, isAuthenticated, logout } = useUser()

  // Redirect to landing page if not authenticated
  if (!isAuthenticated) {
    logMethodExit('ChatPage', { redirecting: true })
    return <Navigate to="/" replace />
  }

  const handleLogout = async (): Promise<void> => {
    logMethodEntry('ChatPage.handleLogout')
    await logout()
    logMethodExit('ChatPage.handleLogout')
  }

  const result = (
    <div className="min-h-screen bg-background p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Welcome, {user?.name}!</CardTitle>
            <p className="text-sm text-muted-foreground">
              Status: {user?.status}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </CardHeader>
        <CardContent>
          <p>Chat interface coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )

  logMethodExit('ChatPage')
  return result
} 