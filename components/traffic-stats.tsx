"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { languageTag, type Locale } from "@/lib/i18n";
import { getMessages } from "@/lib/messages";
import { getServerTrafficStats, getTrafficStats, subscribeTrafficStats, trackPageView } from "@/lib/traffic-stats";

export function TrafficTracker({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();

  useEffect(() => {
    trackPageView(pathname, enabled);
  }, [pathname, enabled]);

  return null;
}

export function TrafficStats({ locale }: { locale: Locale }) {
  const t = getMessages(locale);
  const stats = useSyncExternalStore(subscribeTrafficStats, getTrafficStats, getServerTrafficStats);
  const formatter = new Intl.NumberFormat(languageTag(locale), { notation: "compact", maximumFractionDigits: 1 });
  const countryNames = typeof Intl.DisplayNames === "function"
    ? new Intl.DisplayNames(languageTag(locale), { type: "region" })
    : null;
  const metrics = [
    { label: t.totalPageViews, description: t.pageViewsDescription, value: stats?.pageViews },
    { label: t.totalVisitors, description: t.visitorsDescription, value: stats?.visitors },
  ];

  return (
    <section className="traffic-stats" aria-labelledby="traffic-stats-title">
      <h2 id="traffic-stats-title" className="side-heading">{t.trafficStats}</h2>
      <div className="traffic-panel">
        <dl className="stats-panel traffic-stats-panel">
          {metrics.map(({ label, description, value }) => (
            <div key={label}>
              <dt title={description}>{label}</dt>
              <dd title={value?.toLocaleString(languageTag(locale))}>
                {value === undefined ? "—" : formatter.format(value)}
              </dd>
            </div>
          ))}
        </dl>
        <div className="traffic-countries">
          <div className="traffic-country-heading">
            <h3 title={t.topCountriesDescription}>{t.topCountries}</h3>
            <span title={t.pageViewsDescription}>PV</span>
          </div>
          {stats?.topCountries === undefined ? (
            <p className="traffic-country-empty">—</p>
          ) : stats.topCountries.length === 0 ? (
            <p className="traffic-country-empty">{t.noCountryData}</p>
          ) : (
            <ol className="traffic-country-list" role="list">
              {stats.topCountries.map(({ countryCode, pageViews }, index) => (
                <li key={countryCode}>
                  <span className="traffic-country-rank" aria-hidden="true">{index + 1}</span>
                  <span className="traffic-country-name">{countryNames?.of(countryCode) ?? countryCode}</span>
                  <span className="traffic-country-views" title={pageViews.toLocaleString(languageTag(locale))}>
                    {formatter.format(pageViews)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}
