import type { Locale } from "./i18n";

type PageMessages = {
  home: { loading: string };
  archives: {
    title: string;
    description: string;
    summary: (count: number) => string;
    categories: string;
    browseCategories: string;
    byYear: string;
    postCount: (count: number) => string;
    empty: string;
  };
  about: {
    title: string;
    description: (author: string) => string;
    welcome: string;
    avatar: (author: string) => string;
    profileTitle: string;
    profileIntro: string;
    gamesIntro: string;
    interestsTitle: string;
    interests: string[];
    contactTitle: string;
    contactBefore: string;
    subscribe: string;
    contactAfter: string;
    email: string;
  };
};

const messages: Record<Locale, PageMessages> = {
  zh: {
    home: { loading: "文章加载中…" },
    archives: {
      title: "文章归档",
      description: "按时间浏览所有文章，回看代码与生活的记录。",
      summary: (count) => `${count} 篇文章，慢慢积攒的日常与思考。`,
      categories: "文章分类",
      browseCategories: "按分类浏览",
      byYear: "按年份归档",
      postCount: (count) => `${count} 篇`,
      empty: "第一篇文章还在路上。",
    },
    about: {
      title: "关于",
      description: (author) => `关于 ${author}，以及这个记录代码与生活的小站。`,
      welcome: "很高兴，你来到了这里。",
      avatar: (author) => `${author} 的头像`,
      profileTitle: "关于我",
      profileIntro:
        "我是 Altria，2022 年本科毕业，有 3 年后端开发和 1 年全栈开发经验。从后端到全栈，我喜欢把一个想法慢慢做成能用的东西，也希望能参与从设计、开发到上线的完整过程。",
      gamesIntro:
        "工作之余也喜欢打游戏，平时会玩《三角洲》《无畏契约》《雀魂麻将》和《明日方舟》。",
      interestsTitle: "最近关注的方向",
      interests: ["VRM 模型设计", "全栈开发与 Agent 开发", "日语学习"],
      contactTitle: "保持联系",
      contactBefore: "你可以通过 ",
      subscribe: "RSS 订阅",
      contactAfter: " 关注新文章。欢迎常来坐坐。",
      email: "写封邮件",
    },
  },
  en: {
    home: { loading: "Loading posts…" },
    archives: {
      title: "Post archive",
      description: "Browse every post by date and revisit notes on code and life.",
      summary: (count) =>
        `${count} ${count === 1 ? "post" : "posts"}, a growing collection of everyday moments and thoughts.`,
      categories: "Post categories",
      browseCategories: "Browse by category",
      byYear: "Archive by year",
      postCount: (count) => `${count} ${count === 1 ? "post" : "posts"}`,
      empty: "The first post is on its way.",
    },
    about: {
      title: "About",
      description: (author) =>
        `About ${author} and this little home for notes on code and life.`,
      welcome: "I'm glad you found your way here.",
      avatar: (author) => `${author}'s avatar`,
      profileTitle: "About me",
      profileIntro:
        "I'm Altria. I graduated with a bachelor's degree in 2022 and have 3 years of backend development experience and 1 year of full-stack development experience. Moving from backend to full-stack work, I've found that I enjoy turning an idea into something useful and want to be involved in the whole process, from design and development to launch.",
      gamesIntro:
        "Outside of work, I enjoy playing Delta Force, VALORANT, Mahjong Soul, and Arknights.",
      interestsTitle: "What I'm exploring",
      interests: ["VRM model design", "Full-stack and agent development", "Learning Japanese"],
      contactTitle: "Keep in touch",
      contactBefore: "You can ",
      subscribe: "subscribe via RSS",
      contactAfter: " to follow new posts. You're always welcome to stop by.",
      email: "Send an email",
    },
  },
  ja: {
    home: { loading: "記事を読み込み中…" },
    archives: {
      title: "記事アーカイブ",
      description: "すべての記事を時系列でたどり、コードと日々の暮らしの記録を振り返ります。",
      summary: (count) => `${count} 件の記事。日常のことや考えたことを、少しずつ書きためています。`,
      categories: "記事のカテゴリー",
      browseCategories: "カテゴリーから探す",
      byYear: "年別アーカイブ",
      postCount: (count) => `${count} 件`,
      empty: "最初の記事は、もう少しお待ちください。",
    },
    about: {
      title: "このブログについて",
      description: (author) =>
        `${author} と、コードや日々の暮らしを記録するこの小さなブログについて。`,
      welcome: "ここに来てくださって、うれしいです。",
      avatar: (author) => `${author} のアバター`,
      profileTitle: "自己紹介",
      profileIntro:
        "Altria です。2022 年に大学を卒業し、バックエンド開発を 3 年、フルスタック開発を 1 年経験しています。バックエンドからフルスタックへと取り組む範囲を広げながら、アイデアを少しずつ使えるものにしていくことを楽しんでいます。設計から開発、公開まで、一通り関われるようになりたいと思っています。",
      gamesIntro:
        "仕事の合間にはゲームも楽しんでいます。普段は『Delta Force』『VALORANT』『雀魂』『アークナイツ』を遊んでいます。",
      interestsTitle: "最近関心のあること",
      interests: ["VRM モデルのデザイン", "フルスタック開発とエージェント開発", "日本語の学習"],
      contactTitle: "つながりを大切に",
      contactBefore: "新しい記事は ",
      subscribe: "RSS で購読",
      contactAfter: "できます。また気軽に遊びに来てください。",
      email: "メールを送る",
    },
  },
};

export function getPageMessages(locale: Locale): PageMessages {
  return messages[locale];
}
