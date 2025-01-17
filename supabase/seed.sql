-- Delete any existing general channels first
delete from public.channels where name = 'general';

-- Create the default general channel
insert into public.channels (id, name, description, type)
values (
    'c0d46316-9e1d-4e8b-a7e7-b0a46c17c58c',
    'general',
    'The default channel for general discussion',
    'public'
); 