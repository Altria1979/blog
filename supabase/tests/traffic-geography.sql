-- Run after all migrations in an isolated database; every synthetic visit rolls back.
begin;

do $$
declare
  role_name text;
begin
  if not (select relrowsecurity from pg_class where oid = 'public.blog_traffic_page_views'::regclass) then
    raise exception 'Visit history must enable RLS';
  end if;
  if not coalesce((select reloptions @> array['security_invoker=true'] from pg_class
    where oid = 'public.blog_traffic_country_rankings'::regclass), false) then
    raise exception 'Rankings must check caller permissions';
  end if;
  foreach role_name in array array['anon', 'authenticated'] loop
    if has_table_privilege(role_name, 'public.blog_traffic_page_views', 'SELECT, INSERT, UPDATE, DELETE')
      or has_table_privilege(role_name, 'public.blog_traffic_country_rankings', 'SELECT')
      or has_sequence_privilege(role_name, 'public.blog_traffic_page_views_id_seq', 'USAGE, SELECT, UPDATE')
      or has_function_privilege(role_name, 'public.record_blog_page_view(uuid, inet, text)', 'EXECUTE') then
      raise exception 'Browser roles must not access geography';
    end if;
  end loop;
  if exists (select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'blog_traffic_country_rankings'
    and column_name in ('ip_address', 'visitor_id')) then
    raise exception 'Ranking must only contain aggregate data';
  end if;
end;
$$;

set local role service_role;

do $$
declare
  visitor uuid := gen_random_uuid();
  another uuid := gen_random_uuid();
  legacy uuid := gen_random_uuid();
  initial_pv numeric;
  initial_uv bigint;
  baseline jsonb;
  totals jsonb;
  row record;
  expected_pv integer;
  expected_uv integer;
begin
  select coalesce(sum(page_views), 0), count(*) into initial_pv, initial_uv from public.blog_traffic_visitors;
  select coalesce(jsonb_object_agg(country_code, jsonb_build_object('pv', page_views, 'uv', visitors)), '{}')
    into baseline from public.blog_traffic_country_rankings;

  perform public.record_blog_page_view(visitor, '192.0.2.1', 'CN');
  perform public.record_blog_page_view(visitor, '2001:db8::1', 'CN');
  perform public.record_blog_page_view(visitor, '198.51.100.1', 'US');
  perform public.record_blog_page_view(another, '192.0.2.2', 'CN');
  -- The previous deployment can still call the RPC with only a UUID.
  totals := public.record_blog_page_view(legacy);
  if (totals->>'pageViews')::numeric is distinct from initial_pv + 5
    or (totals->>'visitors')::bigint is distinct from initial_uv + 3 then
    raise exception 'Geography must preserve cookie-based global totals';
  end if;
  if (select count(*) from public.blog_traffic_page_views where visitor_id = visitor) is distinct from 3::bigint
    or (select count(*) from public.blog_traffic_page_views where visitor_id = visitor and ip_address = '2001:db8::1'::inet) is distinct from 1::bigint
    or (select count(*) from public.blog_traffic_page_views where visitor_id = legacy and ip_address is null and country_code is null) is distinct from 1::bigint then
    raise exception 'Each visit must keep its own IP and country or explicit unknown';
  end if;

  for row in select * from public.blog_traffic_country_rankings where country_code in ('CN', 'US', 'ZZ') loop
    expected_pv := case row.country_code when 'CN' then 3 else 1 end;
    expected_uv := case row.country_code when 'CN' then 2 else 1 end;
    if row.page_views is distinct from coalesce((baseline->row.country_code->>'pv')::bigint, 0) + expected_pv
      or row.visitors is distinct from coalesce((baseline->row.country_code->>'uv')::bigint, 0) + expected_uv then
      raise exception 'Country totals must count views and distinct visitors independently';
    end if;
  end loop;
  if (select count(*) from public.blog_traffic_country_rankings where country_code in ('CN', 'US', 'ZZ')) is distinct from 3::bigint then
    raise exception 'All visited countries, including unknown, must be present';
  end if;

  begin
    perform public.record_blog_page_view(visitor, '192.0.2.1', 'invalid');
    raise exception 'Invalid country unexpectedly accepted';
  exception when check_violation then
    null;
  end;
  if (select page_views from public.blog_traffic_visitors where visitor_id = visitor) is distinct from 3::bigint then
    raise exception 'Failed detail insert must roll back its counter increment';
  end if;
end;
$$;

rollback;
