import { languageTag, type Locale } from "./i18n";

type DiaryMessages = {
  title: string;
  description: string;
  subtitle: string;
  empty: string;
  previous: string;
  next: string;
  pagination: string;
  entryLabel: (date: string) => string;
  pageLabel: (page: number, total: number) => string;
};

const number = (value: number, locale: Locale) => new Intl.NumberFormat(languageTag(locale)).format(value);
const messages: Record<Locale, DiaryMessages> = {
  zh: {
    title: "日记",
    description: "Altria 的日记，用文字和照片记下生活里的片刻。",
    subtitle: "把普通的日子，慢慢记下来。",
    empty: "这里还没有日记，等一个值得记下的日子。",
    previous: "上一页",
    next: "下一页",
    pagination: "日记分页",
    entryLabel: (date) => `${date}的日记`,
    pageLabel: (page, total) => `第 ${number(page, "zh")} 页，共 ${number(total, "zh")} 页`,
  },
  en: {
    title: "Diary",
    description: "Altria’s diary: everyday moments in words and photographs.",
    subtitle: "Ordinary days, remembered a little at a time.",
    empty: "No entries in English yet. A new day, a new story to come.",
    previous: "Previous page",
    next: "Next page",
    pagination: "Diary pages",
    entryLabel: (date) => `Diary entry for ${date}`,
    pageLabel: (page, total) => `Page ${number(page, "en")} of ${number(total, "en")}`,
  },
  ja: {
    title: "日記",
    description: "言葉と写真で日々のひとこまを残す、Altria の日記。",
    subtitle: "何気ない日々を、少しずつ書き留めて。",
    empty: "日本語の日記はまだありません。書き留めたい一日を待っています。",
    previous: "前のページ",
    next: "次のページ",
    pagination: "日記のページ",
    entryLabel: (date) => `${date}の日記`,
    pageLabel: (page, total) => `${number(page, "ja")} / ${number(total, "ja")} ページ`,
  },
};

export function getDiaryMessages(locale: Locale): DiaryMessages {
  return messages[locale];
}
