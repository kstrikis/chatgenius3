import { useEffect } from 'react'

import { UserForm } from '../components/UserForm'
import { UserList } from '../components/UserList'

export function UsersPage() {
  useEffect(() => {
    console.log('UsersPage mounted')
  }, [])

  return (
    <div className="users-page" style={{ border: '2px solid red', padding: '20px', margin: '20px' }}>
      <h1>User Management</h1>
      <div className="users-container">
        <div className="form-section">
          <UserForm />
        </div>
        <div className="list-section">
          <UserList />
        </div>
      </div>
    </div>
  )
} 