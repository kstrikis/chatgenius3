import React, { useEffect, useState } from 'react'
import { logMethodEntry, logMethodExit, logError, logInfo } from '../lib/logger'

declare global {
  interface Window {
    createUser: (data: { name: string, email: string }) => Promise<{ id: string, name: string, email: string }>
  }
}

export function UserForm(): React.ReactElement {
  logMethodEntry('UserForm')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect((): (() => void) => {
    logMethodEntry('UserForm.useEffect')
    logInfo('UserForm component mounted')
    return () => {
      logMethodExit('UserForm.useEffect')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    logMethodEntry('UserForm.handleSubmit', { name, email })
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const newUser = await window.createUser({ name, email })
      logInfo('User created successfully', { user: newUser })
      
      if (!newUser) {
        throw new Error('Failed to create user')
      }
      
      // Clear form and show success message
      setName('')
      setEmail('')
      setSuccess(true)
      // Clear success message after 3 seconds
      setTimeout(() => {
        logMethodEntry('UserForm.handleSubmit.timeout')
        setSuccess(false)
        logMethodExit('UserForm.handleSubmit.timeout')
      }, 3000)
      
      logMethodExit('UserForm.handleSubmit', { success: true })
    } catch (err) {
      logError(err instanceof Error ? err : new Error('An error occurred'), 'UserForm.handleSubmit')
      setError(err instanceof Error ? err.message : 'An error occurred')
      logMethodExit('UserForm.handleSubmit', { success: false, error: err })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    logMethodEntry('UserForm.handleNameChange', { value: e.target.value })
    setName(e.target.value)
    logMethodExit('UserForm.handleNameChange')
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    logMethodEntry('UserForm.handleEmailChange', { value: e.target.value })
    setEmail(e.target.value)
    logMethodExit('UserForm.handleEmailChange')
  }

  const result = (
    <form className="user-form" onSubmit={handleSubmit}>
      <h3>Add New User</h3>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">User added successfully!</div>}
      <div>
        <label htmlFor="name">Name:</label>
        <input
          required
          disabled={isSubmitting}
          id="name"
          placeholder="Enter name"
          type="text"
          value={name}
          onChange={handleNameChange}
        />
      </div>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          required
          disabled={isSubmitting}
          id="email"
          placeholder="Enter email"
          type="email"
          value={email}
          onChange={handleEmailChange}
        />
      </div>
      <button disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Adding...' : 'Add User'}
      </button>
    </form>
  )

  logMethodExit('UserForm')
  return result
} 