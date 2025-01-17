-- Drop existing table and its dependencies
drop table if exists public.channels cascade;

-- Create the channels table
create table public.channels (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  description text,
  type text not null check (type in ('public', 'private')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index channels_name_idx on public.channels (name);
create index channels_type_idx on public.channels (type);

-- Create channel_members junction table
create table public.channel_members (
  channel_id uuid references public.channels(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (channel_id, user_id)
);

create index channel_members_user_id_idx on public.channel_members (user_id);

-- Set up Row Level Security (RLS)
alter table public.channels enable row level security;
alter table public.channel_members enable row level security;

-- Create policies for channels
create policy "Channels are viewable by members"
  on public.channels for select
  using (
    exists (
      select 1 from public.channel_members
      where channel_id = channels.id
      and user_id = auth.uid()
    )
    or
    type = 'public'
  );

create policy "Users can create public channels"
  on public.channels for insert
  with check (type = 'public');

-- Create policies for channel_members
create policy "Channel members are viewable by everyone"
  on public.channel_members for select
  using (true);

create policy "Service role can manage channel members"
  on public.channel_members
  using (true);

create policy "Users can join public channels"
  on public.channel_members for insert
  with check (
    exists (
      select 1 from public.channels
      where id = channel_members.channel_id
      and type = 'public'
    )
  );

-- Grant access to authenticated users
grant usage on schema public to authenticated;
grant all on public.channels to authenticated;
grant all on public.channel_members to authenticated;

-- Grant access to anon users (for guest functionality)
grant usage on schema public to anon;
grant select on public.channels to anon;
grant select, insert on public.channel_members to anon; 