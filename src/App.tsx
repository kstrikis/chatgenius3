import React, { useEffect } from 'react'
import { logMethodEntry, logMethodExit, logInfo } from './lib/logger'
import { UsersPage } from './pages/UsersPage'
import './styles/users.css'

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
      <UsersPage />
    </div>
  )

  logMethodExit('App')
  return result
}

export default App

