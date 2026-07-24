begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;

alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table conversations;
alter table public.messages replica identity full;
alter table public.conversations replica identity full;
