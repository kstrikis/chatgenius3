# Messaging Implementation Notes

## Database Schema
- Messages table with RLS policies for channel members
- Channel members table with RLS policies for public channels
- General channel is seeded with fixed UUID: `c0d46316-9e1d-4e8b-a7e7-b0a46c17c58c`

## Key Implementation Details

### User Authentication & Persistence
- Users can be guests or authenticated
- Guest users are created in the users table with `is_guest: true`
- User state is persisted in localStorage with debounced updates
- User status (online/away/offline) is updated based on window focus

### Channel Management
- All new users are automatically added to the general channel
- Channel membership is managed through channel_members table
- RLS policies ensure users can only see channels they're members of
- Default channel (general) is created if no channels exist

### Message Handling
- Messages require proper joins with users table to display names
- Message queries must use: `.select('*, users:user_id (name)')` format
- Real-time updates use Supabase subscriptions per channel
- Messages are loaded when channel changes or real-time update occurs

### Critical RLS Policies
1. Messages table:
   ```sql
   -- Allow service role for initial user setup
   create policy "Service role can manage messages" on messages using (true);
   
   -- Allow channel members to view messages
   create policy "Messages are viewable by channel members" on messages
     for select using (exists (
       select 1 from channel_members
       where channel_members.channel_id = messages.channel_id
       and channel_members.user_id = messages.user_id
     ));
   ```

2. Channel Members table:
   ```sql
   -- Allow service role for initial setup
   create policy "Service role can manage channel members" on channel_members using (true);
   
   -- Allow users to join public channels
   create policy "Users can join public channels" on channel_members
     for insert with check (exists (
       select 1 from channels
       where id = channel_members.channel_id
       and type = 'public'
     ));
   ```

### Known Issues & Requirements
1. Message display requires proper user name joins
2. Channel creation needs proper error handling
3. Guest user persistence needs localStorage
4. Real-time subscriptions must be cleaned up on unmount
5. Page refreshes require re-authentication flow
6. Multiple general channels can appear if seed fails

### Testing Notes
- Cypress tests need proper intercepts for user creation
- Message sending requires channel membership
- Guest login flow needs proper timing for redirects

## Next Steps
1. Fix TypeScript errors in MessageContext (users join type issues)
2. Implement proper error boundaries
3. Add loading states for messages
4. Implement message pagination
5. Add message editing UI
6. Add message deletion UI
7. Implement proper channel switching
8. Add channel creation UI 