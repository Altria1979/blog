import { languageTag, type Locale } from "./i18n";

export function formatDate(date: string, full = false, locale: Locale = "zh") {
  return new Intl.DateTimeFormat(languageTag(locale), {
    timeZone: "Asia/Shanghai",
    year: full ? "numeric" : undefined,
    month: "long",
    day: "numeric",
  }).format(new Date(`${date}T00:00:00+08:00`));
}

export function formatWordCount(count: number, locale: Locale = "zh") {
  if (locale === "en") {
    return new Intl.NumberFormat("en-US", {
      notation: count >= 10000 ? "compact" : "standard",
      maximumFractionDigits: 1,
    }).format(count);
  }
  return count >= 10000
    ? `${(count / 10000).toFixed(1)}${locale === "zh" ? " " : ""}万`
    : count.toLocaleString(languageTag(locale));
}
