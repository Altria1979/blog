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
  const metrics = [
    { label: t.totalPageViews, description: t.pageViewsDescription, value: stats?.pageViews },
    { label: t.totalVisitors, description: t.visitorsDescription, value: stats?.visitors },
  ];

  return (
    <section className="traffic-stats" aria-labelledby="traffic-stats-title">
      <h2 id="traffic-stats-title" className="side-heading">{t.trafficStats}</h2>
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
    </section>
  );
}
