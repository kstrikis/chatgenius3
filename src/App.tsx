import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { UserProvider } from '@/lib/contexts/UserContext'
import { ChatProvider } from '@/lib/contexts/ChatContext'
import { MessageProvider } from '@/lib/contexts/MessageContext'
import { ChannelUsersProvider } from '@/lib/contexts/ChannelUsersContext'
import { LandingPage } from '@/pages/LandingPage'
import { ChatPage } from '@/pages/ChatPage'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Toaster } from '@/components/ui/toaster'
import { logMethodEntry, logMethodExit } from '@/lib/logger'
import '@/styles/users.css'

function App(): React.ReactElement {
  logMethodEntry('App')
  const result = (
    <Router>
      <UserProvider>
        <ChatProvider>
          <MessageProvider>
            <ChannelUsersProvider>
              <div className="app" style={{ minHeight: '100vh', background: '#f0f2f5' }}>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route 
                    path="/chat" 
                    element={
                      <ProtectedRoute>
                        <ChatPage />
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
                <Toaster />
              </div>
            </ChannelUsersProvider>
          </MessageProvider>
        </ChatProvider>
      </UserProvider>
    </Router>
  )
  logMethodExit('App')
  return result
}

export default App

