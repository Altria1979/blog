import { AnimeCatalog } from "@/components/anime-catalog";
import { loadAnimeCatalog, loadAnimeWatchlist } from "@/lib/anime";
import { parseAnimeRange } from "@/lib/anime-shared";
import { getAnimeMessages } from "@/lib/anime-messages";
import type { Locale } from "@/lib/i18n";
import "@/components/anime.css";

export default function AnimePage({ locale = "zh", rangeValue }: { locale?: Locale; rangeValue?: string | string[] }) {
  const catalog = loadAnimeCatalog();
  const messages = getAnimeMessages(locale);
  return (
    <div className="anime-page">
      <header className="anime-header">
        <h1 className="page-heading">{messages.title}</h1>
        <p className="page-description">{messages.subtitle}</p>
      </header>
      <AnimeCatalog locale={locale} catalog={catalog} watchlist={loadAnimeWatchlist(catalog)} range={parseAnimeRange(rangeValue)} />
    </div>
  );
}
