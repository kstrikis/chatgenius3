import { useEffect } from 'react'

import { UsersPage } from './pages/UsersPage'
import './styles/users.css'

function App() {
  useEffect(() => {
    console.log('App component mounted')
  }, [])

  return (
    <div className="app" style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <UsersPage />
    </div>
  )
}

export default App
