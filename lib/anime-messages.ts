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
  browseAll: string;
  watchedOnly: string;
  searchLabel: string;
  searchPlaceholder: string;
  searchAllYears: string;
  clearSearch: string;
  resetFilters: string;
  noMatches: string;
  noMatchesDescription: string;
  noWatched: string;
  resultCount: (count: number) => string;
  yearSummary: (watched: number | null, total: number) => string;
  showMore: (count: number) => string;
  showLess: string;
  details: string;
  closeDetails: string;
  viewSource: string;
  sourceNote: string;
  originalTitles: string;
  releaseYear: string;
  recordDate: string;
  unknownRecordDate: string;
  formats: { movie: string; theatrical: string };
  openDetails: (title: string) => string;
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
    browseAll: "全部",
    watchedOnly: "已看",
    searchLabel: "搜索片名",
    searchPlaceholder: "搜索中文、英文或日文片名",
    searchAllYears: "搜索涵盖所有年份",
    clearSearch: "清除搜索",
    resetFilters: "重置筛选",
    noMatches: "没有找到匹配的作品",
    noMatchesDescription: "试试其他片名，或清除筛选重新浏览。",
    noWatched: "当前范围还没有已看记录。",
    resultCount: (count) => `${number(count, "zh")} 部作品`,
    yearSummary: (watched, total) => watched === null ? `收录 ${number(total, "zh")} 部` : `收录 ${number(total, "zh")} 部 · 已看 ${number(watched, "zh")} 部`,
    showMore: (count) => `展开其余 ${number(count, "zh")} 部`,
    showLess: "收起作品",
    details: "作品资料",
    closeDetails: "关闭作品资料",
    viewSource: "查看资料来源",
    sourceNote: "此链接是片名或发行信息的核查来源。",
    originalTitles: "多语言片名",
    releaseYear: "发行年份",
    recordDate: "记录日期",
    unknownRecordDate: "未记录日期",
    formats: { movie: "动画电影", theatrical: "剧场上映" },
    openDetails: (title) => `查看《${title}》的资料`,
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
    browseAll: "All",
    watchedOnly: "Watched",
    searchLabel: "Search titles",
    searchPlaceholder: "Search Chinese, English or Japanese titles",
    searchAllYears: "Searching across all years",
    clearSearch: "Clear search",
    resetFilters: "Reset filters",
    noMatches: "No matching titles",
    noMatchesDescription: "Try another title or clear the filters to browse again.",
    noWatched: "No watched titles in this selection yet.",
    resultCount: (count) => `${number(count, "en")} ${count === 1 ? "title" : "titles"}`,
    yearSummary: (watched, total) => watched === null ? `${number(total, "en")} ${total === 1 ? "title" : "titles"}` : `${number(total, "en")} ${total === 1 ? "title" : "titles"} · ${number(watched, "en")} watched`,
    showMore: (count) => `Show ${number(count, "en")} more`,
    showLess: "Show fewer titles",
    details: "Title details",
    closeDetails: "Close title details",
    viewSource: "View reference",
    sourceNote: "This reference was used to verify the title or release information.",
    originalTitles: "Titles in other languages",
    releaseYear: "Release year",
    recordDate: "Date recorded",
    unknownRecordDate: "Date not recorded",
    formats: { movie: "Anime film", theatrical: "Theatrical release" },
    openDetails: (title) => `View details for ${title}`,
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
    browseAll: "すべて",
    watchedOnly: "視聴済み",
    searchLabel: "作品名で検索",
    searchPlaceholder: "中国語・英語・日本語の作品名で検索",
    searchAllYears: "すべての年から検索しています",
    clearSearch: "検索をクリア",
    resetFilters: "絞り込みをリセット",
    noMatches: "該当する作品がありません",
    noMatchesDescription: "別の作品名で検索するか、絞り込みを解除してください。",
    noWatched: "この範囲には、まだ視聴済みの記録がありません。",
    resultCount: (count) => `${number(count, "ja")} 作品`,
    yearSummary: (watched, total) => watched === null ? `${number(total, "ja")} 作品を収録` : `${number(total, "ja")} 作品を収録 · ${number(watched, "ja")} 作品を視聴済み`,
    showMore: (count) => `残り ${number(count, "ja")} 作品を表示`,
    showLess: "作品を折りたたむ",
    details: "作品情報",
    closeDetails: "作品情報を閉じる",
    viewSource: "出典を見る",
    sourceNote: "作品名や公開情報の確認に使用した出典です。",
    originalTitles: "各言語の作品名",
    releaseYear: "公開年",
    recordDate: "記録日",
    unknownRecordDate: "日付の記録なし",
    formats: { movie: "アニメ映画", theatrical: "劇場上映" },
    openDetails: (title) => `「${title}」の作品情報を表示`,
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
