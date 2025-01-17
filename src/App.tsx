import React, { useEffect } from 'react'
import { logMethodEntry, logMethodExit, logInfo } from '@/lib/logger'
import { LandingPage } from '@/pages/LandingPage'
import { ChatPage } from '@/pages/ChatPage'
import { Toaster } from '@/components/ui/toaster'
import { UserProvider } from '@/lib/contexts/UserContext'
import { ChatProvider } from '@/lib/contexts/ChatContext'
import { MessageProvider } from '@/lib/contexts/MessageContext'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
    <BrowserRouter>
      <UserProvider>
        <ChatProvider>
          <MessageProvider>
            <div className="app" style={{ minHeight: '100vh', background: '#f0f2f5' }}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/chat" element={<ChatPage />} />
              </Routes>
              <Toaster />
            </div>
          </MessageProvider>
        </ChatProvider>
      </UserProvider>
    </BrowserRouter>
  )

  logMethodExit('App')
  return result
}

export default App

