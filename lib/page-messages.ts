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
    recordTitle: string;
    recordIntro: string;
    recordDetails: string;
    siteTitle: string;
    siteIntro: string;
    siteDetails: string;
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
        "我于 2022 年本科毕业，有 3 年后端开发经验和 1 年全栈开发经验。",
      gamesIntro:
        "工作之余也喜欢打游戏，平时会玩《三角洲》《无畏契约》《雀魂麻将》和《明日方舟》。",
      recordTitle: "留一点自己的记录",
      recordIntro:
        "互联网很大，我想在这里留一小块属于自己的地方。记下写代码时的发现，也收藏生活里值得回看的片段。",
      recordDetails:
        "文章不必每次都有完整的答案。一段实践、一个问题、一张照片，都可以成为记录的开始。",
      siteTitle: "关于这个小站",
      siteIntro:
        "这里围绕文章展开：可以搜索内容、按分类浏览，也可以沿着时间线回看。希望你能轻松找到感兴趣的东西。",
      siteDetails:
        "这里收录了我的年终总结，以及用 Next.js 搭建这个博客的记录。年终总结目前仅有中文。",
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
        "I graduated with a bachelor's degree in 2022 and have 3 years of backend development experience and 1 year of full-stack development experience.",
      gamesIntro:
        "Outside of work, I enjoy playing Delta Force, VALORANT, Mahjong Soul, and Arknights.",
      recordTitle: "Keeping a few notes of my own",
      recordIntro:
        "The internet is a big place, and I wanted a little corner to call my own. Here I write down discoveries made while coding and keep moments from everyday life that are worth revisiting.",
      recordDetails:
        "A post doesn't have to offer a complete answer every time. An experiment, a question, or a photograph can all be the beginning of a record.",
      siteTitle: "About this little site",
      siteIntro:
        "Posts are at the heart of this site. You can search their content, browse by category, or look back through the timeline. I hope it's easy to find something that interests you.",
      siteDetails:
        "This site includes my year-in-review posts and a record of how this blog is built with Next.js. The year-in-review posts are currently available only in Chinese.",
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
        "2022 年に大学の学部を卒業し、バックエンド開発を 3 年、フルスタック開発を 1 年経験しています。",
      gamesIntro:
        "仕事の合間にはゲームも楽しんでいます。普段は『Delta Force』『VALORANT』『雀魂』『アークナイツ』を遊んでいます。",
      recordTitle: "自分の記録を少しずつ",
      recordIntro:
        "広いインターネットの片隅に、自分のための小さな場所を作りたいと思いました。コードを書いていて気づいたことや、暮らしの中でまた振り返りたくなる場面を残していきます。",
      recordDetails:
        "記事には、いつも完全な答えがなくてもいいと思っています。何かを試したこと、一つの疑問、一枚の写真。どれも記録の始まりになります。",
      siteTitle: "この小さなブログについて",
      siteIntro:
        "このブログの中心は記事です。内容を検索したり、カテゴリー別に探したり、時系列で振り返ったりできます。興味のあるものを、気軽に見つけてもらえたらうれしいです。",
      siteDetails:
        "このブログには、一年の振り返りと、Next.js でこのブログを作る記録を掲載しています。一年の振り返りは、現在中国語のみです。",
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
