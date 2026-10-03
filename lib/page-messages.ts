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
    interests: { title: string; description: string }[];
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
        "我是 Altria，2022 年本科毕业，有 3 年后端开发和 1 年全栈开发经验。从后端到全栈，我喜欢把一个想法慢慢做成能用的东西，也希望能参与从设计、开发到上线的完整过程。",
      gamesIntro:
        "工作之余也喜欢打游戏，平时会玩《三角洲》《无畏契约》《雀魂麻将》和《明日方舟》。",
      interestsTitle: "最近关注的方向",
      interests: [
        {
          title: "VRM 模型设计",
          description:
            "对虚拟角色和 VRM 模型设计很感兴趣，想从角色外观、表情到动作表现，一点点做出有自己风格的角色。也期待把模型和交互结合起来，让它不只是一个可以展示的形象，还能成为有趣体验的一部分。",
        },
        {
          title: "全栈开发与 Agent 开发",
          description:
            "继续深入全栈开发，也把 Agent 开发作为接下来想多花时间的方向。除了把前后端串起来，我更关心怎样让模型、工具和工作流配合起来，解决具体的问题。希望从自己的日常需求出发，做一些真正用得上的小工具和应用。",
        },
        {
          title: "日语学习",
          description:
            "日语是想长期坚持的另一件事。希望慢慢积累词汇、练习听说和阅读，能更自在地看懂喜欢的作品、查阅资料，也能用日语交流。不急着给自己贴上什么水平的标签，先让学习成为日常。",
        },
      ],
      recordTitle: "留一点自己的记录",
      recordIntro:
        "互联网很大，我想在这里留一小块属于自己的地方。记下写代码时的发现，也收藏生活里值得回看的片段。",
      recordDetails:
        "文章不必每次都有完整的答案。一段实践、一个问题、一张照片，都可以成为记录的开始。",
      siteTitle: "关于这个小站",
      siteIntro:
        "这里围绕文章展开：可以搜索内容、按分类浏览，也可以沿着时间线回看。希望你能轻松找到感兴趣的东西。",
      siteDetails:
        "这里收录了我的年终总结，以及用 Next.js 搭建这个博客的记录。以后也想把模型设计、开发实践和日语学习中的尝试慢慢写下来。",
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
      interests: [
        {
          title: "VRM model design",
          description:
            "I'm interested in virtual characters and VRM model design. I'd like to create characters with a style of my own, working through their appearance, expressions, and movement one step at a time. I also want to explore how these models can become part of an interactive experience, beyond simply being something to look at.",
        },
        {
          title: "Full-stack and agent development",
          description:
            "I want to keep deepening my full-stack skills and spend more time on AI agent development. Alongside connecting the frontend and backend, I'm interested in how models, tools, and workflows can work together to solve specific problems. I'd like to start with everyday needs of my own and build small tools and apps that I actually use.",
        },
        {
          title: "Learning Japanese",
          description:
            "Japanese is another interest I want to keep pursuing over time. I hope to build my vocabulary and practice listening, speaking, and reading so I can enjoy the works I love, read reference material, and communicate more comfortably in Japanese. For now, I'm focusing on making learning part of everyday life rather than putting a label on my level.",
        },
      ],
      recordTitle: "Keeping a few notes of my own",
      recordIntro:
        "The internet is a big place, and I wanted a little corner to call my own. Here I write down discoveries made while coding and keep moments from everyday life that are worth revisiting.",
      recordDetails:
        "A post doesn't have to offer a complete answer every time. An experiment, a question, or a photograph can all be the beginning of a record.",
      siteTitle: "About this little site",
      siteIntro:
        "Posts are at the heart of this site. You can search their content, browse by category, or look back through the timeline. I hope it's easy to find something that interests you.",
      siteDetails:
        "This site includes my year-in-review posts and a record of how this blog is built with Next.js. Over time, I'd also like to share my experiments with model design, development, and learning Japanese.",
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
      interests: [
        {
          title: "VRM モデルのデザイン",
          description:
            "バーチャルキャラクターや VRM モデルのデザインに興味があります。見た目や表情、動きを少しずつ考えながら、自分らしいキャラクターを作ってみたいです。眺めて楽しむだけでなく、モデルをインタラクティブな体験の一部にすることにも挑戦したいと思っています。",
        },
        {
          title: "フルスタック開発とエージェント開発",
          description:
            "フルスタック開発をさらに深めつつ、AI エージェントの開発にも時間をかけていきたいです。フロントエンドとバックエンドをつなぐことに加えて、モデルやツール、ワークフローを組み合わせて、具体的な課題をどう解決するかに関心があります。自分の日常の困りごとを出発点に、実際に使える小さなツールやアプリを作っていきたいと思っています。",
        },
        {
          title: "日本語の学習",
          description:
            "日本語も、長く続けていきたいことの一つです。語彙を増やし、聞く・話す・読む練習を重ねながら、好きな作品や資料をもっと気軽に読んだり、日本語でやり取りしたりできるようになりたいです。今のレベルに名前をつけることを急がず、まずは学習を日常の一部にしていこうと思っています。",
        },
      ],
      recordTitle: "自分の記録を少しずつ",
      recordIntro:
        "広いインターネットの片隅に、自分のための小さな場所を作りたいと思いました。コードを書いていて気づいたことや、暮らしの中でまた振り返りたくなる場面を残していきます。",
      recordDetails:
        "記事には、いつも完全な答えがなくてもいいと思っています。何かを試したこと、一つの疑問、一枚の写真。どれも記録の始まりになります。",
      siteTitle: "この小さなブログについて",
      siteIntro:
        "このブログの中心は記事です。内容を検索したり、カテゴリー別に探したり、時系列で振り返ったりできます。興味のあるものを、気軽に見つけてもらえたらうれしいです。",
      siteDetails:
        "このブログには、一年の振り返りと、Next.js でこのブログを作る記録を掲載しています。これからは、モデルのデザインや開発、日本語学習で試したことも少しずつ書いていきたいです。",
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
