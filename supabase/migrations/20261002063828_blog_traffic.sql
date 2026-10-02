-- One anonymous browser identity per row; no IP, user agent or URL is stored.
create table public.blog_traffic_visitors (
  visitor_id uuid primary key,
  page_views bigint not null default 1 check (page_views > 0),
  first_seen timestamptz not null default clock_timestamp(),
  last_seen timestamptz not null default clock_timestamp()
);

alter table public.blog_traffic_visitors enable row level security;
revoke all on table public.blog_traffic_visitors from public, anon, authenticated, service_role;
grant select, insert, update on table public.blog_traffic_visitors to service_role;

create function public.record_blog_page_view(p_visitor_id uuid)
returns jsonb
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  totals jsonb;
begin
  if p_visitor_id is null then
    raise exception 'A visitor identity is required' using errcode = '22004';
  end if;

  insert into public.blog_traffic_visitors as visitors (visitor_id)
  values (p_visitor_id)
  on conflict (visitor_id) do update
  set page_views = visitors.page_views + 1,
      last_seen = clock_timestamp();

  -- A separate statement sees this call's upsert, unlike a modifying CTE.
  select jsonb_build_object(
    'pageViews', coalesce(sum(page_views), 0),
    'visitors', count(*)
  ) into totals
  from public.blog_traffic_visitors;

  return totals;
end;
$$;

revoke all on function public.record_blog_page_view(uuid) from public, anon, authenticated, service_role;
grant execute on function public.record_blog_page_view(uuid) to service_role;
