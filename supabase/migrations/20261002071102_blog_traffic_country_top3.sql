-- Return the public country aggregates with the same counting call. No extra page view or request.
create or replace function public.record_blog_page_view(
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
    'visitors', count(*),
    'topCountries', (
      select coalesce(jsonb_agg(
        jsonb_build_object('countryCode', country_code, 'pageViews', page_views)
        order by page_views desc, country_code
      ), '[]'::jsonb)
      from (
        select country_code, page_views
        from public.blog_traffic_country_rankings
        where country_code not in ('XX', 'ZZ')
        order by page_views desc, country_code
        limit 3
      ) ranked
    )
  ) into totals
  from public.blog_traffic_visitors;

  return totals;
end;
$$;

revoke all on function public.record_blog_page_view(uuid, inet, text) from public, anon, authenticated, service_role;
grant execute on function public.record_blog_page_view(uuid, inet, text) to service_role;

