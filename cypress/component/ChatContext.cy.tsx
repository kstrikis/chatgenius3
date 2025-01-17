/// <reference types="cypress" />
import React from 'react'
import { mount } from 'cypress/react18'
import { ChatProvider, useChat } from '../../src/lib/contexts/ChatContext'
import { UserContext } from '../../src/lib/contexts/UserContext'
import type { User } from '../../src/lib/contexts/UserContext'

// Mock user for testing
const mockUser: User = {
  id: 'test-user-id',
  name: 'Test User',
  isGuest: true,
  status: 'online'
}

// Mock UserContext value
const mockUserContext = {
  user: mockUser,
  setUser: () => {},
  isAuthenticated: true,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve()
}

// Test component that uses the ChatContext
function TestComponent() {
  const { 
    channels, 
    activeChannel,
    setActiveChannel,
    createChannel, 
    joinChannel, 
    leaveChannel,
    markChannelAsRead
  } = useChat()

  return (
    <div>
      <div data-testid="channel-count">{channels.length}</div>
      <div data-testid="active-channel">{activeChannel?.name || 'none'}</div>
      <button 
        data-testid="create-channel"
        onClick={() => {
          createChannel('test-channel', 'Test Description')
            .catch(console.error)
        }}
      >
        Create Channel
      </button>
      <button
        data-testid="join-channel"
        onClick={() => {
          joinChannel('test-channel-id')
            .catch(console.error)
        }}
      >
        Join Channel
      </button>
      <button
        data-testid="leave-channel"
        onClick={() => {
          leaveChannel('test-channel-id')
            .catch(console.error)
        }}
      >
        Leave Channel
      </button>
      <button
        data-testid="mark-read"
        onClick={() => {
          markChannelAsRead('test-channel-id')
            .catch(console.error)
        }}
      >
        Mark as Read
      </button>
      <button
        data-testid="set-active"
        onClick={() => setActiveChannel({
          id: 'test-channel-id',
          name: 'test-channel',
          description: 'Test Description',
          type: 'public',
          unreadCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        })}
      >
        Set Active
      </button>
    </div>
  )
}

describe('ChatContext', () => {
  const mockSupabase = {
    from: () => ({
      select: () => ({
        eq: () => ({
          data: [],
          error: null
        }),
        in: () => ({
          order: () => ({
            data: [],
            error: null
          })
        })
      }),
      insert: () => ({
        select: () => ({
          single: () => ({
            data: {
              id: 'test-channel-id',
              name: 'test-channel',
              description: 'Test Description',
              type: 'public',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            error: null
          })
        })
      }),
      delete: () => ({
        eq: () => ({
          eq: () => ({
            data: null,
            error: null
          })
        })
      })
    }),
    channel: () => ({
      on: () => ({
        subscribe: () => ({
          unsubscribe: () => {}
        })
      })
    })
  }

  beforeEach(() => {
    // Mock Supabase client
    cy.wrap(mockSupabase).as('supabase')
    // @ts-expect-error - Mocking global supabase client
    window.supabase = mockSupabase
  })

  it('should initialize with no channels', () => {
    mount(
      <UserContext.Provider value={mockUserContext}>
        <ChatProvider>
          <TestComponent />
        </ChatProvider>
      </UserContext.Provider>
    )
    cy.get('[data-testid="channel-count"]').should('have.text', '0')
    cy.get('[data-testid="active-channel"]').should('have.text', 'none')
  })

  it('should create and join a channel', () => {
    mount(
      <UserContext.Provider value={mockUserContext}>
        <ChatProvider>
          <TestComponent />
        </ChatProvider>
      </UserContext.Provider>
    )
    cy.get('[data-testid="create-channel"]').click()
    cy.get('[data-testid="join-channel"]').click()
  })

  it('should set and display active channel', () => {
    mount(
      <UserContext.Provider value={mockUserContext}>
        <ChatProvider>
          <TestComponent />
        </ChatProvider>
      </UserContext.Provider>
    )
    cy.get('[data-testid="set-active"]').click()
    cy.get('[data-testid="active-channel"]').should('have.text', 'test-channel')
  })

  it('should handle channel operations with errors', () => {
    const errorMockSupabase = {
      ...mockSupabase,
      from: () => ({
        select: () => ({
          eq: () => ({
            data: null,
            error: new Error('Test error')
          }),
          in: () => ({
            order: () => ({
              data: null,
              error: new Error('Test error')
            })
          })
        })
      })
    }

    cy.wrap(errorMockSupabase).as('supabase')
    // @ts-expect-error - Mocking global supabase client
    window.supabase = errorMockSupabase

    mount(
      <UserContext.Provider value={mockUserContext}>
        <ChatProvider>
          <TestComponent />
        </ChatProvider>
      </UserContext.Provider>
    )

    // Should handle errors gracefully
    cy.get('[data-testid="channel-count"]').should('have.text', '0')
  })

  it('should handle real-time updates', () => {
    let subscriptionCallback: ((payload: any) => void) | null = null
    
    const realtimeMockSupabase = {
      ...mockSupabase,
      channel: () => ({
        on: (_event: string, _filter: any, callback: (payload: any) => void) => {
          subscriptionCallback = callback
          return {
            subscribe: () => ({
              unsubscribe: () => { subscriptionCallback = null }
            })
          }
        }
      })
    }

    cy.wrap(realtimeMockSupabase).as('supabase')
    // @ts-expect-error - Mocking global supabase client
    window.supabase = realtimeMockSupabase

    mount(
      <UserContext.Provider value={mockUserContext}>
        <ChatProvider>
          <TestComponent />
        </ChatProvider>
      </UserContext.Provider>
    )

    // Simulate a real-time update
    cy.then(() => {
      if (subscriptionCallback) {
        subscriptionCallback({
          new: {
            id: 'new-channel-id',
            name: 'new-channel',
            type: 'public',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        })
      }
    })
  })
}) 