# State Management and Component Architecture

## Data Models

### Channel
```typescript
interface Channel {
  id: string
  name: string
  description?: string
  type: 'public' | 'private'
  members: string[]  // user IDs
  lastMessage?: Message
  unreadCount: number
  createdAt: Date
  updatedAt: Date
}
```

### Message
```typescript
interface Message {
  id: string
  channelId: string
  userId: string
  content: string
  formattedContent: FormattedSegment[]
  attachments?: Attachment[]
  reactions?: Reaction[]
  replyToId?: string
  threadCount?: number
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

interface FormattedSegment {
  text: string
  formats: {
    type: 'bold' | 'italic' | 'strike' | 'link'
    url?: string
  }[]
}

interface Attachment {
  id: string
  type: 'file' | 'image'
  url: string
  name: string
  size: number
  mimeType: string
}

interface Reaction {
  emoji: string
  count: number
  users: string[]  // user IDs
}
```

### User
```typescript
interface User {
  id: string
  name: string
  email?: string
  avatar?: string
  status: 'online' | 'away' | 'offline'
  lastSeen: Date
  isGuest: boolean
}
```

## Context Structure

### ChatContext
- Manages active channel/DM selection
- Handles channel list and updates
- Manages unread counts
- Provides channel switching functionality

### MessageContext
- Manages message list for current channel
- Handles message pagination
- Manages message updates (edits, deletes)
- Handles thread state
- Manages message formatting state

### UserContext (existing)
- Enhanced to handle user presence
- Manages user list and status updates
- Handles DM state

## Component Hierarchy

```
App
├── ChatPage
│   ├── LeftSidebar
│   │   ├── WorkspaceHeader
│   │   ├── Navigation
│   │   ├── ChannelList
│   │   │   └── ChannelItem
│   │   ├── DirectMessageList
│   │   │   └── UserItem
│   │   └── UserStatus
│   ├── MainContent
│   │   ├── ChannelHeader
│   │   ├── MessageList
│   │   │   ├── MessageGroup
│   │   │   │   ├── MessageHeader
│   │   │   │   └── MessageContent
│   │   │   └── DateSeparator
│   │   └── MessageInput
│   │       ├── FormatToolbar
│   │       ├── TextArea
│   │       └── ActionButtons
│   └── RightSidebar
│       ├── ThreadHeader
│       ├── ThreadMessages
│       └── ThreadInput
└── Modals
    ├── ChannelInfo
    ├── UserProfile
    └── FilePreview
```

## State Management Strategy

### Local Component State
- UI state (format toolbar visibility, input focus)
- Form state (message input, thread replies)
- Temporary UI feedback (loading states, errors)

### Context State
- Active channel/conversation
- Message lists and updates
- User presence and status
- Unread counts and notifications

### Supabase Real-time Subscriptions
- Channel updates
- New messages
- Message modifications
- User presence changes
- Reactions and threads

## Data Flow

1. Initial Load
   - Load user data and authenticate
   - Subscribe to user presence
   - Load channel list
   - Load recent messages for active channel

2. Channel Switching
   - Update active channel in ChatContext
   - Load channel messages with pagination
   - Mark channel as read
   - Subscribe to channel updates

3. Message Operations
   - Send: Optimistic update + backend confirmation
   - Edit: Immediate local update + sync
   - Delete: Local removal + backend confirmation
   - React: Optimistic update + sync

4. Real-time Updates
   - New message: Append to list if relevant
   - Message update: Patch existing message
   - User status: Update user list
   - Channel update: Refresh channel data

## Error Handling

1. Network Errors
   - Retry mechanisms for failed operations
   - Offline support for message drafts
   - Reconnection handling for real-time subscriptions

2. Optimistic Updates
   - Rollback mechanisms for failed operations
   - Temporary IDs for new messages
   - Queue system for pending operations

3. Error Boundaries
   - Component-level error catching
   - Graceful degradation
   - User feedback

## Performance Considerations

1. Message List
   - Virtualized list for large message sets
   - Pagination with infinite scroll
   - Debounced real-time updates

2. Real-time Updates
   - Batched updates for multiple changes
   - Throttled presence updates
   - Selective subscription management

3. State Updates
   - Memoized selectors for derived data
   - Debounced state persistence
   - Optimized re-render prevention

## Testing Strategy

1. Unit Tests
   - Context providers and hooks
   - Utility functions
   - State management logic

2. Component Tests
   - Individual component rendering
   - User interactions
   - Error states

3. Integration Tests
   - Message flow
   - Channel switching
   - Real-time updates

4. E2E Tests
   - Critical user paths
   - Multi-user scenarios
   - Network conditions

## Logging Strategy

1. User Actions
   ```typescript
   logUserAction('message.send', { channelId, messageId })
   logUserAction('channel.switch', { fromId, toId })
   ```

2. State Changes
   ```typescript
   logStateChange('messages.update', { channelId, count })
   logStateChange('presence.update', { userId, status })
   ```

3. Error Tracking
   ```typescript
   logError('message.send.failed', error, { messageId })
   logError('subscription.disconnected', error, { channel })
   ```

## Next Steps

1. Component Implementation
   - [x] Break down ChatPage into smaller components
   - [x] Implement context providers
   - [x] Create custom hooks for common operations

2. State Management
   - [x] Set up ChatContext
   - [ ] Set up MessageContext
   - [x] Implement real-time subscriptions

3. Data Layer
   - [x] Create Supabase tables and policies
   - [x] Implement data access layer
   - [x] Set up real-time channels

4. Testing
   - [x] Add component tests for ChatContext
   - [ ] Add component tests for MessageContext
   - [ ] Add integration tests for real-time updates

## Implementation Progress

### Completed
1. ChatContext
   - Channel management (create, join, leave)
   - Real-time channel updates
   - Error handling and logging
   - Component tests with mocked Supabase client
   - Integration with UserContext

2. Database Schema
   - Users table with presence
   - Channels table with RLS policies
   - Channel members junction table

3. Testing Infrastructure
   - Cypress component testing setup
   - E2E testing configuration
   - Test utilities and mocks
   - Component tests for UserForm and ChatContext
   - Basic E2E test for landing page

4. Utilities
   - Database field name transformation (snake_case <-> camelCase)
   - Logging infrastructure with method entry/exit tracking
   - Type definitions for all models
   - Global error handling

### In Progress
1. MessageContext
   - Message list management
   - Real-time message updates
   - Message formatting
   - Thread support

2. Component Architecture
   - Channel list component
   - Message list component
   - Message input component
   - Thread view component

### Next Up
1. Message Infrastructure
   - Create messages table
   - Implement message formatting
   - Set up real-time subscriptions
   - Add optimistic updates

2. Thread Support
   - Add thread-related fields
   - Implement thread UI
   - Handle thread notifications

3. Performance Optimizations
   - Message pagination
   - Virtualized lists
   - Subscription management 