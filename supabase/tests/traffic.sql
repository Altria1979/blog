-- Run after the migration in an isolated database. All synthetic visits roll back.
begin;

do $$
begin
  if not (select relrowsecurity from pg_class where oid = 'public.blog_traffic_visitors'::regclass) then
    raise exception 'Traffic table must enable RLS';
  end if;
  if (select prosecdef from pg_proc where oid = 'public.record_blog_page_view(uuid, inet, text)'::regprocedure) then
    raise exception 'Traffic RPC must use SECURITY INVOKER';
  end if;
  if has_table_privilege('anon', 'public.blog_traffic_visitors', 'SELECT, INSERT, UPDATE, DELETE')
    or has_table_privilege('authenticated', 'public.blog_traffic_visitors', 'SELECT, INSERT, UPDATE, DELETE')
    or has_function_privilege('anon', 'public.record_blog_page_view(uuid, inet, text)', 'EXECUTE')
    or has_function_privilege('authenticated', 'public.record_blog_page_view(uuid, inet, text)', 'EXECUTE') then
    raise exception 'Browser roles must not access traffic storage';
  end if;
end;
$$;

set local role service_role;

do $$
declare
  visitor uuid := gen_random_uuid();
  another uuid := gen_random_uuid();
  initial_pv numeric;
  initial_uv bigint;
  totals jsonb;
begin
  select coalesce(sum(page_views), 0), count(*) into initial_pv, initial_uv
  from public.blog_traffic_visitors;

  totals := public.record_blog_page_view(visitor);
  if jsonb_typeof(totals->'pageViews') is distinct from 'number'
    or jsonb_typeof(totals->'visitors') is distinct from 'number'
    or (totals->>'pageViews')::numeric is distinct from initial_pv + 1
    or (totals->>'visitors')::bigint is distinct from initial_uv + 1 then
    raise exception 'First visit must include its own write';
  end if;

  totals := public.record_blog_page_view(visitor);
  if jsonb_typeof(totals->'pageViews') is distinct from 'number'
    or jsonb_typeof(totals->'visitors') is distinct from 'number'
    or (totals->>'pageViews')::numeric is distinct from initial_pv + 2
    or (totals->>'visitors')::bigint is distinct from initial_uv + 1 then
    raise exception 'Repeat visit must preserve visitor count';
  end if;

  totals := public.record_blog_page_view(another);
  if jsonb_typeof(totals->'pageViews') is distinct from 'number'
    or jsonb_typeof(totals->'visitors') is distinct from 'number'
    or (totals->>'pageViews')::numeric is distinct from initial_pv + 3
    or (totals->>'visitors')::bigint is distinct from initial_uv + 2 then
    raise exception 'Another identity must add another visitor';
  end if;

  begin
    perform public.record_blog_page_view(null);
    raise exception 'Null identity unexpectedly accepted';
  exception when null_value_not_allowed then
    null;
  end;
end;
$$;

rollback;
