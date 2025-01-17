-- Reset tables
TRUNCATE users, channels, channel_members, messages CASCADE;

-- Create users
WITH inserted_users AS (
  INSERT INTO users (id, name, is_guest, status) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Sarah Chen', false, 'online'),
    ('22222222-2222-2222-2222-222222222222', 'Marcus Rodriguez', false, 'online'),
    ('33333333-3333-3333-3333-333333333333', 'Priya Patel', false, 'away'),
    ('44444444-4444-4444-4444-444444444444', 'Alex Kim', false, 'online')
  RETURNING *
)
SELECT * FROM inserted_users;

-- Create general channel
WITH inserted_channel AS (
  INSERT INTO channels (id, name, description, type) VALUES
    ('c0d46316-9e1d-4e8b-a7e7-b0a46c17c58c', 'general', 'Team-wide discussions and updates', 'public')
  RETURNING *
)
SELECT * FROM inserted_channel;

-- Add users to general channel
INSERT INTO channel_members (channel_id, user_id)
SELECT 'c0d46316-9e1d-4e8b-a7e7-b0a46c17c58c', id
FROM users;

-- Insert messages with realistic timestamps
WITH RECURSIVE dates AS (
  SELECT NOW() - INTERVAL '30 days' AS msg_date
  UNION ALL
  SELECT msg_date + INTERVAL '1 hour'
  FROM dates
  WHERE msg_date < NOW()
),
numbered_dates AS (
  SELECT msg_date, ROW_NUMBER() OVER (ORDER BY msg_date) AS rnum
  FROM dates
  LIMIT 200
)
INSERT INTO messages (channel_id, user_id, content, created_at)
SELECT 
  'c0d46316-9e1d-4e8b-a7e7-b0a46c17c58c' as channel_id,
  CASE 
    WHEN rnum % 4 = 1 THEN '11111111-1111-1111-1111-111111111111'  -- Sarah
    WHEN rnum % 4 = 2 THEN '22222222-2222-2222-2222-222222222222'  -- Marcus
    WHEN rnum % 4 = 3 THEN '33333333-3333-3333-3333-333333333333'  -- Priya
    ELSE '44444444-4444-4444-4444-444444444444'                     -- Alex
  END as user_id,
  CASE 
    -- Project Kickoff (Day 1)
    WHEN rnum = 1 THEN 'Team, excited to kick off our new chat application project. Let''s discuss the initial architecture and tech stack.'
    WHEN rnum = 2 THEN 'For the frontend, I suggest we use React with TypeScript and Tailwind CSS. Thoughts?'
    WHEN rnum = 3 THEN 'On the backend side, I recommend using Node.js with Express and PostgreSQL. We can use Supabase for real-time features.'
    WHEN rnum = 4 THEN 'I can set up the CI/CD pipeline with GitHub Actions and deploy to AWS ECS.'
    
    -- Architecture Discussion (Day 2-3)
    WHEN rnum = 5 THEN 'Let''s break down the components. We need: Authentication, Real-time messaging, Channel management, and User presence.'
    WHEN rnum = 6 THEN 'For the UI components, I''ll create a design system using shadcn/ui. Here''s the initial structure:
```tsx
// src/components/chat/
- MessageList.tsx
- MessageInput.tsx
- ChannelList.tsx
- UserPresence.tsx
```'
    WHEN rnum = 7 THEN 'I''ll set up the database schema with proper indexes for message querying. Here''s the initial migration:
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  content TEXT NOT NULL,
  channel_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_messages_channel_created ON messages(channel_id, created_at);
```'
    WHEN rnum = 8 THEN 'For monitoring, I''ll set up Datadog with custom metrics for message delivery latency and WebSocket connection health.'
    
    -- Implementation Updates (Day 4-7)
    WHEN rnum = 9 THEN 'Review the authentication flow PR: https://github.com/org/repo/pull/123. I''ve implemented JWT handling and session management.'
    WHEN rnum = 10 THEN 'The message list component is ready for review. I''ve added virtual scrolling for performance:
```tsx
const MessageList: React.FC = () => {
  const { messages } = useMessages();
  return (
    <VirtualList
      height={600}
      itemCount={messages.length}
      itemSize={50}
      renderItem={({ index }) => (
        <MessageItem message={messages[index]} />
      )}
    />
  );
};
```'
    WHEN rnum = 11 THEN 'Added database functions for message search and pagination. The query performance looks good with the new indexes.'
    WHEN rnum = 12 THEN 'Deployment pipeline is set up. Each PR now gets a preview environment with end-to-end tests.'
    
    -- Code Review Discussions (Day 8-10)
    WHEN rnum = 13 THEN 'Marcus, great work on the virtual scrolling. Can you add error boundaries and loading states?'
    WHEN rnum = 14 THEN 'Thanks Sarah, I''ll add those. Also considering adding message grouping by time and user.'
    WHEN rnum = 15 THEN 'The message search function needs optimization. Current query plan shows a sequential scan.'
    WHEN rnum = 16 THEN 'Security scan found we need to rate limit the WebSocket connections. I''ll add that today.'
    
    -- Performance Optimization (Day 11-15)
    WHEN rnum = 17 THEN 'Let''s optimize the message fetching. Current latency is ~200ms, target is <100ms.'
    WHEN rnum = 18 THEN 'Added message caching with React Query. Also implemented optimistic updates:
```tsx
const sendMessage = useMutation({
  mutationFn: (message: NewMessage) => api.sendMessage(message),
  onMutate: async (newMessage) => {
    await queryClient.cancelQueries(["messages"]);
    const previousMessages = queryClient.getQueryData(["messages"]);
    queryClient.setQueryData(["messages"], (old) => [...old, newMessage]);
    return { previousMessages };
  },
});
```'
    WHEN rnum = 19 THEN 'Implemented database partitioning by channel_id. Query times are now down to 50ms.'
    WHEN rnum = 20 THEN 'Added connection pooling and WebSocket compression. Seeing 30% reduction in bandwidth usage.'
    
    -- Security Review (Day 16-20)
    WHEN rnum = 21 THEN 'Starting security review. Key areas: Authentication, Data validation, Rate limiting.'
    WHEN rnum = 22 THEN 'Added input sanitization and XSS protection to message content:
```tsx
const sanitizeMessage = (content: string): string => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ["b", "i", "code", "pre"],
    ALLOWED_ATTR: ["class"]
  });
};
```'
    WHEN rnum = 23 THEN 'Implemented row-level security in PostgreSQL for message access control.'
    WHEN rnum = 24 THEN 'Set up AWS WAF rules and added DDoS protection.'
    
    -- Feature Completion (Day 21-30)
    WHEN rnum = 25 THEN 'Final testing phase. Please review the test coverage report.'
    WHEN rnum = 26 THEN 'UI tests are passing. Added new tests for error states and offline mode.'
    WHEN rnum = 27 THEN 'Database performance is stable. Added monitoring alerts for query times.'
    WHEN rnum = 28 THEN 'Deployment checklist is complete. Ready for production release.'
    
    -- Default messages for remaining slots
    ELSE (
      CASE (rnum % 20)
        WHEN 1 THEN 'Updated the component documentation with new props and examples.'
        WHEN 2 THEN 'The new error handling looks good. Much better user experience now.'
        WHEN 3 THEN 'Added indexes to improve the channel member lookup performance.'
        WHEN 4 THEN 'Monitoring shows stable latency after the recent optimizations.'
        WHEN 5 THEN 'Let''s review the API documentation before the next release.'
        WHEN 6 THEN 'Fixed the race condition in the message delivery system.'
        WHEN 7 THEN 'Added unit tests for the new message formatting features.'
        WHEN 8 THEN 'Updated the deployment scripts to handle rollbacks better.'
        WHEN 9 THEN 'The new caching layer is working well in staging.'
        WHEN 10 THEN 'Security scan is clean after the recent updates.'
        WHEN 11 THEN 'Added type safety improvements to the message handlers.'
        WHEN 12 THEN 'Performance metrics are looking good after the optimization.'
        WHEN 13 THEN 'Updated the error messages to be more user-friendly.'
        WHEN 14 THEN 'The new logging format is much easier to parse.'
        WHEN 15 THEN 'Added integration tests for the WebSocket reconnection.'
        WHEN 16 THEN 'Updated the load balancer configuration for better scaling.'
        WHEN 17 THEN 'The new message queue handling looks much more robust.'
        WHEN 18 THEN 'Added proper cleanup for disconnected WebSocket sessions.'
        WHEN 19 THEN 'Updated the API rate limiting configuration.'
        ELSE 'Reviewed and approved the latest PR. Good to merge.'
      END
    )
  END as content,
  msg_date as created_at
FROM numbered_dates;

-- Update message timestamps to be during working hours (9 AM to 6 PM)
UPDATE messages
SET created_at = date_trunc('day', created_at) + 
  INTERVAL '9 hours' + 
  (EXTRACT(HOUR FROM created_at - date_trunc('day', created_at)) % 9) * INTERVAL '1 hour' +
  EXTRACT(MINUTE FROM created_at) * INTERVAL '1 minute'
WHERE EXTRACT(HOUR FROM created_at) < 9 OR EXTRACT(HOUR FROM created_at) > 17; 