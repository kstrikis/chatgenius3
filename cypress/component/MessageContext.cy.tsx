/// <reference types="cypress" />
import React from 'react'
import { mount } from 'cypress/react18'
import { MessageProvider, useMessages } from '../../src/lib/contexts/MessageContext'
import { UserContext } from '../../src/lib/contexts/UserContext'
import { useChat } from '../../src/lib/contexts/ChatContext'
import type { User } from '../../src/lib/contexts/UserContext'
import type { Channel } from '../../src/lib/contexts/ChatContext'

// Mock user for testing
const mockUser: User = {
  id: 'test-user-id',
  name: 'Test User',
  isGuest: true,
  status: 'online'
}

// Mock channel for testing
const mockChannel: Channel = {
  id: 'test-channel-id',
  name: 'test-channel',
  description: 'Test Description',
  type: 'public',
  unreadCount: 0,
  createdAt: new Date(),
  updatedAt: new Date()
}

// Mock context values
const mockUserContext = {
  user: mockUser,
  setUser: () => {},
  isAuthenticated: true,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve()
}

const mockChatContext = {
  activeChannel: mockChannel,
  channels: [mockChannel],
  setActiveChannel: () => {},
  createChannel: () => Promise.resolve(mockChannel),
  joinChannel: () => Promise.resolve(),
  leaveChannel: () => Promise.resolve(),
  markChannelAsRead: () => Promise.resolve()
}

// Test component that uses the MessageContext
function TestComponent() {
  const { messages, sendMessage, editMessage, deleteMessage } = useMessages()

  return (
    <div>
      <div data-testid="message-count">{messages.length}</div>
      <div data-testid="messages">
        {messages.map(message => (
          <div key={message.id} data-testid={`message-${message.id}`}>
            {message.content}
          </div>
        ))}
      </div>
      <button 
        data-testid="send-message"
        onClick={() => {
          sendMessage('Test message')
            .catch(console.error)
        }}
      >
        Send Message
      </button>
      <button
        data-testid="edit-message"
        onClick={() => {
          editMessage('test-message-id', 'Edited message')
            .catch(console.error)
        }}
      >
        Edit Message
      </button>
      <button
        data-testid="delete-message"
        onClick={() => {
          deleteMessage('test-message-id')
            .catch(console.error)
        }}
      >
        Delete Message
      </button>
    </div>
  )
}

describe('MessageContext', () => {
  const mockSupabase = {
    from: () => ({
      select: () => ({
        eq: () => ({
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
              id: 'test-message-id',
              channelId: 'test-channel-id',
              userId: 'test-user-id',
              content: 'Test message',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              deletedAt: null
            },
            error: null
          })
        })
      }),
      update: () => ({
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

  it('should initialize with no messages', () => {
    mount(
      <UserContext.Provider value={mockUserContext}>
        <ChatContext.Provider value={mockChatContext}>
          <MessageProvider>
            <TestComponent />
          </MessageProvider>
        </ChatContext.Provider>
      </UserContext.Provider>
    )
    cy.get('[data-testid="message-count"]').should('have.text', '0')
  })

  it('should send a message', () => {
    mount(
      <UserContext.Provider value={mockUserContext}>
        <ChatContext.Provider value={mockChatContext}>
          <MessageProvider>
            <TestComponent />
          </MessageProvider>
        </ChatContext.Provider>
      </UserContext.Provider>
    )
    cy.get('[data-testid="send-message"]').click()
  })

  it('should edit a message', () => {
    mount(
      <UserContext.Provider value={mockUserContext}>
        <ChatContext.Provider value={mockChatContext}>
          <MessageProvider>
            <TestComponent />
          </MessageProvider>
        </ChatContext.Provider>
      </UserContext.Provider>
    )
    cy.get('[data-testid="edit-message"]').click()
  })

  it('should delete a message', () => {
    mount(
      <UserContext.Provider value={mockUserContext}>
        <ChatContext.Provider value={mockChatContext}>
          <MessageProvider>
            <TestComponent />
          </MessageProvider>
        </ChatContext.Provider>
      </UserContext.Provider>
    )
    cy.get('[data-testid="delete-message"]').click()
  })

  it('should handle message operations with errors', () => {
    const errorMockSupabase = {
      ...mockSupabase,
      from: () => ({
        select: () => ({
          eq: () => ({
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
        <ChatContext.Provider value={mockChatContext}>
          <MessageProvider>
            <TestComponent />
          </MessageProvider>
        </ChatContext.Provider>
      </UserContext.Provider>
    )

    // Should handle errors gracefully
    cy.get('[data-testid="message-count"]').should('have.text', '0')
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
        <ChatContext.Provider value={mockChatContext}>
          <MessageProvider>
            <TestComponent />
          </MessageProvider>
        </ChatContext.Provider>
      </UserContext.Provider>
    )

    // Simulate a real-time update
    cy.then(() => {
      if (subscriptionCallback) {
        subscriptionCallback({
          new: {
            id: 'new-message-id',
            channelId: 'test-channel-id',
            userId: 'test-user-id',
            content: 'New message',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null
          }
        })
      }
    })
  })
}) 