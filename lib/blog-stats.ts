import { formatWordCount } from "./format";
import { type Locale } from "./i18n";

const dayInMilliseconds = 24 * 60 * 60 * 1000;
const shanghaiCalendar = new Intl.DateTimeFormat("en", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function calendarDate(value: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
    ? date
    : undefined;
}

function countUnit(count: number, unit: "year" | "month" | "day", locale: Locale) {
  if (locale === "en") return `${count} ${unit}${count === 1 ? "" : "s"}`;
  const suffixes = locale === "zh"
    ? { year: "年", month: "个月", day: "天" }
    : { year: "年", month: "か月", day: "日" };
  return `${count}${suffixes[unit]}`;
}

/** Whole Shanghai calendar months; month-end anniversaries use the month's final day. */
export function formatBlogAge(established: string, now: number, locale: Locale = "zh") {
  const start = calendarDate(established);
  if (!start || !Number.isFinite(new Date(now).getTime())) return "—";
  const parts = shanghaiCalendar.formatToParts(new Date(now));
  const value = (type: string) => parts.find((part) => part.type === type)?.value;
  const today = calendarDate(`${value("year")}-${value("month")}-${value("day")}`);
  if (!today) return "—";

  let months = (today.getUTCFullYear() - start.getUTCFullYear()) * 12
    + today.getUTCMonth() - start.getUTCMonth();
  const finalDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0)).getUTCDate();
  if (today.getUTCDate() < Math.min(start.getUTCDate(), finalDay)) months -= 1;
  if (months > 0) {
    const years = Math.floor(months / 12);
    const remainder = months % 12;
    return [years && countUnit(years, "year", locale), remainder && countUnit(remainder, "month", locale)]
      .filter(Boolean).join(locale === "en" ? " " : "");
  }

  const days = Math.max(0, Math.floor((today.getTime() - start.getTime()) / dayInMilliseconds));
  return days > 0 ? countUnit(days, "day", locale)
    : { zh: "不足1天", en: "Less than 1 day", ja: "1日未満" }[locale];
}

/** Build recency uses elapsed minutes, hours and 24-hour days, independent of midnight. */
export function formatBuildAge(builtAt: string, now: number, locale: Locale = "zh") {
  const timestamp = Date.parse(builtAt);
  if (!calendarDate(builtAt.slice(0, 10)) || !Number.isFinite(timestamp)
    || !Number.isFinite(new Date(now).getTime())) return "—";
  const elapsed = Math.max(0, now - timestamp);
  if (elapsed < 60_000) return { zh: "刚刚", en: "Just now", ja: "たった今" }[locale];
  const [unit, duration] = elapsed >= dayInMilliseconds ? ["day", dayInMilliseconds] as const
    : elapsed >= 3_600_000 ? ["hour", 3_600_000] as const
    : ["minute", 60_000] as const;
  const count = Math.floor(elapsed / duration);
  if (locale === "en") return `${count} ${unit}${count === 1 ? "" : "s"} ago`;
  const suffix = locale === "zh"
    ? { day: "天前", hour: "小时前", minute: "分钟前" }[unit]
    : { day: "日前", hour: "時間前", minute: "分前" }[unit];
  return `${count}${suffix}`;
}

export function formatBlogWordCount(count: number, locale: Locale = "zh") {
  if (!Number.isFinite(count)) return "—";
  const total = Math.max(0, Math.floor(count));
  return total >= 10_000 && locale !== "en"
    ? `${(total / 10_000).toFixed(2)}万`
    : formatWordCount(total, locale);
}
