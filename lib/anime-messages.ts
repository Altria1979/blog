import { languageTag, type Locale } from "./i18n";
import type { AnimeRange } from "./anime-shared";

type AnimeMessages = {
  title: string;
  description: string;
  subtitle: string;
  range: string;
  ranges: Record<AnimeRange, string>;
  apply: string;
  pending: string;
  pendingDescription: string;
  watched: string;
  unwatched: string;
  empty: string;
  source: string;
  sourceSite: string;
  sourceCode: string;
  total: (count: number) => string;
  progress: (watched: number, total: number) => string;
  recordedOn: (date: string) => string;
  year: (year: number) => string;
  coverage: (first: number, last: number) => string;
};

const number = (value: number, locale: Locale) => new Intl.NumberFormat(languageTag(locale)).format(value);

const messages: Record<Locale, AnimeMessages> = {
  zh: {
    title: "动画",
    description: "Altria 的动画清单，按年份回望那些看过的故事。",
    subtitle: "有些故事，看过以后就留在了生活里。",
    range: "年份范围",
    ranges: { all: "全部年份", "5": "最近 5 年", "10": "最近 10 年", "15": "最近 15 年" },
    apply: "查看",
    pending: "观影记录待补充",
    pendingDescription: "先把片单整理在这里，看过的故事会慢慢标记。",
    watched: "已看",
    unwatched: "未标记",
    empty: "这个年份范围内还没有收录作品。",
    source: "灵感与基础片单来自 EGOIST 的 anime-sedai。",
    sourceSite: "原站",
    sourceCode: "开源项目",
    total: (count) => `收录 ${number(count, "zh")} 部`,
    progress: (watched, total) => `已看 ${number(watched, "zh")} / ${number(total, "zh")} 部`,
    recordedOn: (date) => `记录于 ${date}`,
    year: (year) => `${year} 年`,
    coverage: (first, last) => `${first}—${last} 年精选片单，持续补充，并非完整动画目录。`,
  },
  en: {
    title: "Anime",
    description: "Altria’s anime watchlist: looking back on stories, year by year.",
    subtitle: "Some stories stay with you long after the credits roll.",
    range: "Year range",
    ranges: { all: "All years", "5": "Last 5 years", "10": "Last 10 years", "15": "Last 15 years" },
    apply: "View",
    pending: "Viewing history coming soon",
    pendingDescription: "The list is here. I’ll gradually mark the stories I’ve watched.",
    watched: "Watched",
    unwatched: "Unmarked",
    empty: "No titles have been added for these years yet.",
    source: "Inspired by anime-sedai by EGOIST, with its list as a starting point.",
    sourceSite: "Original site",
    sourceCode: "Source project",
    total: (count) => `${number(count, "en")} titles`,
    progress: (watched, total) => `Watched ${number(watched, "en")} of ${number(total, "en")}`,
    recordedOn: (date) => `Recorded ${date}`,
    year: (year) => String(year),
    coverage: (first, last) => `A growing selection from ${first}–${last}, rather than a complete anime directory.`,
  },
  ja: {
    title: "アニメ",
    description: "年ごとに物語を振り返る、Altria のアニメ視聴リスト。",
    subtitle: "見終わっても、日々の中に残り続ける物語。",
    range: "年代",
    ranges: { all: "すべての年", "5": "直近 5 年", "10": "直近 10 年", "15": "直近 15 年" },
    apply: "表示",
    pending: "視聴記録は準備中です",
    pendingDescription: "まずは作品リストから。見た作品は少しずつ記録していきます。",
    watched: "視聴済み",
    unwatched: "未記録",
    empty: "この年代の作品はまだ登録されていません。",
    source: "EGOIST の anime-sedai を参考に、作品リストを拡充しています。",
    sourceSite: "元のサイト",
    sourceCode: "ソースコード",
    total: (count) => `${number(count, "ja")} 作品を収録`,
    progress: (watched, total) => `${number(total, "ja")} 作品中 ${number(watched, "ja")} 作品を視聴`,
    recordedOn: (date) => `記録日：${date}`,
    year: (year) => `${year} 年`,
    coverage: (first, last) => `${first}〜${last} 年の作品を選んで収録しています。網羅的な一覧ではありません。`,
  },
};

export function getAnimeMessages(locale: Locale): AnimeMessages {
  return messages[locale];
}
