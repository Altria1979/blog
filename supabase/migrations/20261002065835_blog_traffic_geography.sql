-- Record request-time geography so a later country change never moves old visits.
create table public.blog_traffic_page_views (
  id bigint generated always as identity primary key,
  visitor_id uuid not null references public.blog_traffic_visitors(visitor_id),
  ip_address inet,
  country_code text check (country_code ~ '^[A-Z]{2}$' and country_code not in ('XX', 'ZZ')),
  visited_at timestamptz not null default clock_timestamp()
);

create index blog_traffic_page_views_visitor_id_idx on public.blog_traffic_page_views(visitor_id);

alter table public.blog_traffic_page_views enable row level security;
revoke all on table public.blog_traffic_page_views from public, anon, authenticated, service_role;
grant select, insert on table public.blog_traffic_page_views to service_role;
revoke all on sequence public.blog_traffic_page_views_id_seq from public, anon, authenticated, service_role;
grant usage on sequence public.blog_traffic_page_views_id_seq to service_role;

-- Replace the old signature rather than introducing ambiguous RPC overloads.
-- Defaults preserve requests from the previous deployment during rollout.
drop function public.record_blog_page_view(uuid);
create function public.record_blog_page_view(
  p_visitor_id uuid,
  p_ip_address inet default null,
  p_country_code text default null
)
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

  insert into public.blog_traffic_page_views(visitor_id, ip_address, country_code)
  values (p_visitor_id, p_ip_address, p_country_code);

  select jsonb_build_object(
    'pageViews', coalesce(sum(page_views), 0),
    'visitors', count(*)
  ) into totals
  from public.blog_traffic_visitors;

  return totals;
end;
$$;

revoke all on function public.record_blog_page_view(uuid, inet, text) from public, anon, authenticated, service_role;
grant execute on function public.record_blog_page_view(uuid, inet, text) to service_role;

-- Dashboard-only aggregate; this view deliberately contains no visitor IDs or IPs.
create view public.blog_traffic_country_rankings with (security_invoker = true) as
select
  coalesce(country_code, 'ZZ') as country_code,
  count(*) as page_views,
  count(distinct visitor_id) as visitors,
  min(visited_at) as first_seen,
  max(visited_at) as last_seen
from public.blog_traffic_page_views
group by country_code;

revoke all on table public.blog_traffic_country_rankings from public, anon, authenticated, service_role;
grant select on table public.blog_traffic_country_rankings to service_role;

comment on table public.blog_traffic_page_views is 'Private request history from the geography rollout onward. IPs and country codes come from Vercel headers; missing data stays NULL. No historical visits are backfilled.';
comment on view public.blog_traffic_country_rankings is 'Country PV/UV since geography rollout. ZZ means unknown. A visitor in multiple countries counts once within each country. ORDER BY page_views DESC, visitors DESC, country_code for ranking.';
