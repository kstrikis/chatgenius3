import React, { useEffect } from 'react'
import { logMethodEntry, logMethodExit, logInfo } from '../lib/logger'
import { UserForm } from '../components/UserForm'
import { UserList } from '../components/UserList'

export function UsersPage(): React.ReactElement {
  logMethodEntry('UsersPage')
  useEffect((): (() => void) => {
    logMethodEntry('UsersPage.useEffect')
    logInfo('UsersPage mounted')
    return () => {
      logMethodExit('UsersPage.useEffect')
    }
  }, [])

  const result = (
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

  logMethodExit('UsersPage')
  return result
} 