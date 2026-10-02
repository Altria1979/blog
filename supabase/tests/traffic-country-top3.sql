-- Isolated database ONLY: temporary fixture replaces local data, then rolls back.
begin;
truncate public.blog_traffic_page_views, public.blog_traffic_visitors;
set local role service_role;

do $$
declare
  visitor uuid := gen_random_uuid();
  country text;
  totals jsonb;
begin
  totals := public.record_blog_page_view(visitor);
  if totals->'topCountries' is distinct from '[]'::jsonb then
    raise exception 'Unknown countries must not invent ranking entries';
  end if;
  totals := public.record_blog_page_view(visitor, '192.0.2.1', 'GB');
  if totals->'topCountries' is distinct from '[{"countryCode":"GB","pageViews":1}]'::jsonb then
    raise exception 'One known country must return one row and include this call';
  end if;

  foreach country in array array['US','US','US','US','JP','JP','JP','CN','CN','CN',null,null,null,null,null] loop
    totals := public.record_blog_page_view(visitor, '192.0.2.1', country);
  end loop;
  if totals->'topCountries' is distinct from '[{"countryCode":"US","pageViews":4},{"countryCode":"CN","pageViews":3},{"countryCode":"JP","pageViews":3}]'::jsonb then
    raise exception 'Top 3 must exclude unknown, limit rows, sort PV descending then country code';
  end if;
  if (totals->>'pageViews')::bigint is distinct from 17::bigint
    or (totals->>'visitors')::bigint is distinct from 1::bigint then
    raise exception 'Reading the ranking must not add visits';
  end if;
  if (select array_agg(key order by key) from jsonb_object_keys(totals) key)
    is distinct from array['pageViews','topCountries','visitors'] then
    raise exception 'RPC must only expose aggregate fields';
  end if;
end;
$$;

rollback;
