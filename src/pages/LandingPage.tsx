import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useUser } from '@/lib/contexts/UserContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { logMethodEntry, logMethodExit, logError, logInfo } from '@/lib/logger'

export function LandingPage(): React.ReactElement {
  logMethodEntry('LandingPage')
  const [guestName, setGuestName] = useState('')
  const { login, isAuthenticated, isLoading } = useUser()
  const { toast } = useToast()

  // Redirect authenticated users to chat
  if (!isLoading && isAuthenticated) {
    logInfo('LandingPage: User already authenticated, redirecting to chat')
    return <Navigate to="/chat" replace />
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    logMethodEntry('LandingPage.handleSubmit')
    e.preventDefault()
    try {
      await login(guestName)
      toast({
        title: 'Welcome!',
        description: 'You have successfully joined the chat.'
      })
    } catch (error) {
      logError(error as Error, 'LandingPage.handleSubmit')
      toast({
        title: 'Error',
        description: 'Failed to join chat. Please try again.',
        variant: 'destructive'
      })
    }
    logMethodExit('LandingPage.handleSubmit')
  }

  const result = (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h1 className="text-center text-3xl font-bold text-gray-900">Welcome to ChatGenius</h1>
          <p className="mt-2 text-center text-sm text-gray-600">Join the conversation as a guest</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <Input
              type="text"
              placeholder="Enter a guest name (optional)"
              value={guestName}
              onChange={(e): void => setGuestName(e.target.value)}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            />
          </div>
          <div>
            <Button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Join as Guest
            </Button>
          </div>
        </form>
      </div>
    </div>
  )

  logMethodExit('LandingPage')
  return result
} 