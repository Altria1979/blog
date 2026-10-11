import { AnimeCatalog } from "@/components/anime-catalog";
import { connection } from "next/server";
import { loadAnimeCatalog, loadAnimeWatchlist } from "@/lib/anime";
import { getAnimeMessages } from "@/lib/anime-messages";
import type { Locale } from "@/lib/i18n";
import "@/components/anime.css";

export default async function AnimePage({ locale = "zh" }: { locale?: Locale }) {
  // Render URL filters on the first response as well as during client navigation.
  await connection();
  const catalog = loadAnimeCatalog();
  const messages = getAnimeMessages(locale);
  return (
    <div className="anime-page">
      <header className="anime-header">
        <h1 className="page-heading">{messages.title}</h1>
        <p className="page-description">{messages.subtitle}</p>
      </header>
      <AnimeCatalog locale={locale} catalog={catalog} watchlist={loadAnimeWatchlist(catalog)} />
    </div>
  );
}
