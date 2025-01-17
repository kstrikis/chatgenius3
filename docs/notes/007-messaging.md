# Real-time Messaging Implementation

## Overview
This document outlines the implementation of real-time messaging functionality in ChatGenius, focusing on message sending, storage, and real-time updates using Supabase.

## Requirements
1. Users should be able to send messages in channels
2. Messages should be stored in the database
3. Messages should appear in real-time for all users
4. Messages should maintain proper formatting and structure
5. Database fields should map correctly between snake_case and camelCase

## Database Schema
```sql
create table messages (
  id uuid default uuid_generate_v4() primary key,
  channel_id uuid references channels(id) not null,
  user_id uuid references users(id) not null,
  content text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  deleted_at timestamptz
);

-- Enable Row Level Security
alter table messages enable row level security;

-- Create policies
create policy "Messages are viewable by channel members" on messages
  for select using (
    exists (
      select 1 from channel_members
      where channel_members.channel_id = messages.channel_id
      and channel_members.user_id = auth.uid()
    )
  );

create policy "Messages can be inserted by channel members" on messages
  for insert with check (
    exists (
      select 1 from channel_members
      where channel_members.channel_id = messages.channel_id
      and channel_members.user_id = auth.uid()
    )
  );

create policy "Messages can be updated by their authors" on messages
  for update using (
    auth.uid() = user_id
  );

-- Enable realtime
alter publication supabase_realtime add table messages;
```

## Implementation Steps

1. Database Migration
   - Create messages table
   - Set up RLS policies
   - Enable realtime functionality

2. Message Context Updates
   - Add message sending functionality
   - Implement real-time subscription
   - Handle message state management

3. UI Components
   - Update MessageInput for sending
   - Enhance MessageList for real-time updates
   - Implement optimistic updates

4. Testing
   - Add component tests for messaging
   - Test real-time functionality
   - Verify database mapping

## Data Flow

1. Sending Messages
```typescript
async function sendMessage(channelId: string, content: string): Promise<void> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      channel_id: channelId,
      content,
      user_id: currentUser.id
    })
    .select()
    .single();

  if (error) throw error;
  return mapDbRowToMessage(data);
}
```

2. Real-time Subscription
```typescript
function subscribeToChannelMessages(channelId: string): void {
  supabase
    .channel(`messages:${channelId}`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` },
      (payload) => {
        handleMessageChange(mapDbRowToMessage(payload.new));
      }
    )
    .subscribe();
}
```

## Error Handling
- Handle network failures during message send
- Implement retry mechanism for failed messages
- Provide user feedback for errors
- Log all errors appropriately

## Logging Strategy
```typescript
// Message sending
logMethodEntry('sendMessage', { channelId, content });
logMethodExit('sendMessage', { messageId });

// Real-time updates
logMethodEntry('handleMessageChange', { messageId });
logMethodExit('handleMessageChange');

// Error handling
logError('Failed to send message', error, { channelId });
```

## Next Steps
1. Implement database migration
2. Update ChatContext with messaging functionality
3. Add real-time subscription handling
4. Update UI components
5. Add comprehensive testing 