-- Create messages table
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