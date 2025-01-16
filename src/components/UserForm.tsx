import { useEffect, useState } from 'react'

import { createUser } from '../lib/supabaseTest'

export function UserForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    console.log('UserForm component mounted')
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Submitting form with:', { name, email })
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const newUser = await createUser({ name, email })
      console.log('User created:', newUser)
      if (!newUser) {
        throw new Error('Failed to create user')
      }
      // Clear form and show success message
      setName('')
      setEmail('')
      setSuccess(true)
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Error in handleSubmit:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="user-form">
      <h3>Add New User</h3>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">User added successfully!</div>}
      <div>
        <label htmlFor="name">Name:</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isSubmitting}
          placeholder="Enter name"
        />
      </div>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isSubmitting}
          placeholder="Enter email"
        />
      </div>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Adding...' : 'Add User'}
      </button>
    </form>
  )
} 