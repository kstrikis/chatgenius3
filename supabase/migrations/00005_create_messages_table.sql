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
      and channel_members.user_id = messages.user_id
    )
  );

create policy "Service role can manage messages" on messages
  using (true);

create policy "Messages can be inserted by channel members" on messages
  for insert with check (
    exists (
      select 1 from channel_members
      where channel_members.channel_id = channel_id
      and channel_members.user_id = user_id
    )
  );

create policy "Messages can be updated by their authors" on messages
  for update using (
    user_id in (
      select id from users where id = messages.user_id
    )
  );

-- Grant access to authenticated and anonymous users
grant usage on schema public to authenticated, anon;
grant all on messages to authenticated, anon;

-- Drop existing publication if it exists
drop publication if exists supabase_realtime;

-- Create publication for all tables
create publication supabase_realtime for all tables;

-- Enable replication on specific tables
alter table messages replica identity full;
alter table channels replica identity full;
alter table users replica identity full;
alter table channel_members replica identity full; 