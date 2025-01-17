import React, { useEffect } from 'react'
import { logMethodEntry, logMethodExit, logInfo } from '@/lib/logger'
import { LandingPage } from '@/pages/LandingPage'
import { Toaster } from '@/components/ui/toaster'
import '@/styles/users.css'

function App(): React.ReactElement {
  logMethodEntry('App')
  useEffect((): (() => void) => {
    logMethodEntry('App.useEffect')
    logInfo('App component mounted')
    return () => {
      logMethodExit('App.useEffect')
    }
  }, [])

  const result = (
    <div className="app" style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <LandingPage />
      <Toaster />
    </div>
  )

  logMethodExit('App')
  return result
}

export default App

