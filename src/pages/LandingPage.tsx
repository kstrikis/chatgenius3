import React, { useState } from 'react'
import { logMethodEntry, logMethodExit, logInfo, logError } from '@/lib/logger'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'

interface GuestFormData {
  name: string
}

export function LandingPage(): React.ReactElement {
  logMethodEntry('LandingPage')
  const [formData, setFormData] = useState<GuestFormData>({ name: '' })
  const { toast } = useToast()

  const handleGuestSubmit = async (e: React.FormEvent): Promise<void> => {
    logMethodEntry('LandingPage.handleGuestSubmit')
    e.preventDefault()
    
    try {
      // TODO: Implement guest login logic
      logInfo('Guest login attempt', { name: formData.name || 'anonymous' })
      
      // Temporary logging until we implement the actual login
      logInfo('Guest login successful', { name: formData.name || 'anonymous' })
      toast({
        title: 'Success',
        description: 'Logged in successfully',
      })
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to login')
      logError(error, 'LandingPage.handleGuestSubmit')
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      })
      logMethodExit('LandingPage.handleGuestSubmit', { error: error.message })
      return
    }

    logMethodExit('LandingPage.handleGuestSubmit', { success: true })
  }

  const handleAuth0Login = async (): Promise<void> => {
    logMethodEntry('LandingPage.handleAuth0Login')
    // TODO: Implement Auth0 login
    toast({
      title: 'Coming Soon',
      description: 'Auth0 login will be available soon',
    })
    logMethodExit('LandingPage.handleAuth0Login')
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData({ ...formData, name: e.target.value })
  }

  const result = (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl text-center">Welcome to ChatGenius</CardTitle>
          <CardDescription className="text-center">
            A modern messaging app with powerful AI features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Try it out now</h2>
            
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="Enter a guest name (optional)"
              className="w-full"
            />

            <Button
              onClick={handleGuestSubmit}
              className="w-full"
              variant="default"
            >
              Join as Guest
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              onClick={handleAuth0Login}
              className="w-full"
              variant="outline"
            >
              Sign in with Auth0
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            By continuing, you agree to our{' '}
            <a href="#" className="underline hover:text-primary">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="underline hover:text-primary">Privacy Policy</a>
          </p>
        </CardContent>
      </Card>
    </div>
  )

  logMethodExit('LandingPage')
  return result
} 