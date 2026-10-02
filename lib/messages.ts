import type { Locale } from "./i18n";

const zh = {
  posts: "文章", archives: "归档", about: "关于", home: "首页",
  mainNavigation: "主导航", navigationMenu: "导航菜单", openNavigation: "打开导航菜单", closeNavigation: "关闭导航菜单",
  avatar: (name: string) => `${name} 的头像`, siteHome: (name: string) => `${name}首页`,
  sidebarNote: ["在自己的节奏里，", "把日子写成故事。"], email: "邮箱", rss: "RSS 订阅", aboutSite: "关于这个小站",
  searchArticles: "搜索文章", searchPlaceholder: "搜索文章、分类、标签…", searchKeywords: "搜索关键词", closeSearch: "关闭搜索",
  searchCount: (count: number) => `找到 ${count} 篇文章`, searchPrompt: "从这里，找到想读的内容", searchEmpty: "暂时没有找到", searchRetry: "换一个关键词，再试试看。",
  searchFields: "标题 · 摘要 · 分类 · 标签", close: "关闭",
  articleList: "文章列表", articleCategories: "文章分类", allArticles: "全部文章", allCategories: "全部分类", wordCount: (count: number) => `${count} 字`, postCount: (count: number) => `${count} 篇`, clearTag: "清除标签筛选",
  readingMinutes: (count: number) => `${count} 分钟`, noArticles: "这里还没有文章", noArticlesHint: "换个分类看看，故事还在继续。", browseArticles: "浏览全部文章",
  pagination: "文章分页", previousPage: "上一页", nextPage: "下一页", feedFootnote: "慢慢写，慢慢积累。",
  featuredArticles: "精选文章", carousel: "轮播", carouselKeyboard: "精选文章，使用左右方向键切换", previousFeatured: "上一篇精选文章", nextFeatured: "下一篇精选文章",
  blogStats: "博客统计", operatingTime: "运营时长", lastBuild: "上次更新", totalWords: "总字数",
  trafficStats: "访问统计", totalPageViews: "累计浏览量", totalVisitors: "累计访客",
  pageViewsDescription: "页面被浏览的累计次数（PV），包含重复浏览。", visitorsDescription: "按浏览器 Cookie 中的访客 ID 去重的访客数（UV），清除 Cookie 或换浏览器可能算作新访客，不代表精确的自然人数。",
  topCountries: "国家访问 Top 3", topCountriesDescription: "按已识别国家的累计浏览量（PV）排序。", noCountryData: "暂无国家数据",
  welcome: "欢迎来到我的小世界", categories: "分类",
  footerNote: "让热爱留下痕迹。", designReferenceBefore: "以", designReferenceAfter: "为设计参考", lastUpdated: (date: string) => `最近更新于 ${date}`,
  appearance: "外观设置", themeLight: "浅色模式", themeSystem: "跟随系统", themeDark: "深色模式",
  shareErrorHelp: "复制失败，请复制地址栏链接", shareDescription: "复制文章标题、摘要与链接", copied: "已复制", copyFailed: "复制失败", shareText: "文字分享",
  code: "代码", codeCopied: "代码已复制", codeCopyFailed: "复制失败，请选中代码复制", disableCodeWrap: "关闭代码自动换行", enableCodeWrap: "开启代码自动换行", disableWrap: "关闭自动换行", wrap: "自动换行", copyCode: "复制代码",
  codeLines: (count: number) => `${count} 行代码`, collapseCode: "收起代码", expandCode: "展开代码", codeStats: (lines: number, characters: number, bytes: number) => `${lines} 行 · ${characters} 字符 · ${bytes} 字节`,
  image: "图片", imageUnavailable: "图片暂时无法加载", articleImage: "文章配图", enlargeImage: (alt: string) => `放大图片：${alt}`, viewImage: "查看文章图片", closeImage: "关闭图片",
  backToTop: "回到顶部", tableOfContents: "文章目录", articleSections: "文章章节", noSections: "本文暂无章节目录", openContents: "打开文章目录", closeContents: "关闭文章目录",
  technicalInfo: "技术信息", buildPlatform: "构建平台", imageStorage: "图片存储", softwareLicense: "软件协议", contentLicense: "文章许可", canonicalDomain: "规范域名", unspecified: "未声明", selfHosted: "本站托管", expandBuild: "展开构建信息", collapseBuild: "收起构建信息",
};

type Messages = typeof zh;

const en: Messages = {
  posts: "Posts", archives: "Archives", about: "About", home: "Home",
  mainNavigation: "Main navigation", navigationMenu: "Navigation menu", openNavigation: "Open navigation menu", closeNavigation: "Close navigation menu",
  avatar: (name) => `${name}'s avatar`, siteHome: (name) => `${name} home`,
  sidebarNote: ["At my own pace,", "turning days into stories."], email: "Email", rss: "RSS feed", aboutSite: "About this blog",
  searchArticles: "Search posts", searchPlaceholder: "Search posts, categories, tags…", searchKeywords: "Search keywords", closeSearch: "Close search",
  searchCount: (count) => `${count} ${count === 1 ? "post" : "posts"} found`, searchPrompt: "Find something to read", searchEmpty: "No results yet", searchRetry: "Try another keyword.",
  searchFields: "Title · Summary · Category · Tags", close: "Close",
  articleList: "Posts", articleCategories: "Post categories", allArticles: "All posts", allCategories: "All categories", wordCount: (count) => `${count} ${count === 1 ? "word" : "words"}`, postCount: (count) => `${count} ${count === 1 ? "post" : "posts"}`, clearTag: "Clear tag filter",
  readingMinutes: (count) => `${count} min read`, noArticles: "No posts here yet", noArticlesHint: "Try another category. The story continues.", browseArticles: "Browse all posts",
  pagination: "Post pages", previousPage: "Previous page", nextPage: "Next page", feedFootnote: "Writing a little, building a little.",
  featuredArticles: "Featured posts", carousel: "carousel", carouselKeyboard: "Featured posts, use left and right arrow keys to navigate", previousFeatured: "Previous featured post", nextFeatured: "Next featured post",
  blogStats: "Blog statistics", operatingTime: "Running for", lastBuild: "Last updated", totalWords: "Total words",
  trafficStats: "Traffic statistics", totalPageViews: "Total views", totalVisitors: "Total visitors",
  pageViewsDescription: "Total page views (PV), including repeat views.", visitorsDescription: "Visitors (UV) deduplicated by a browser cookie ID. Clearing cookies or switching browsers may count as a new visitor. An estimate, not an exact count of people.",
  topCountries: "Top 3 countries", topCountriesDescription: "Known countries ranked by total page views (PV).", noCountryData: "No country data yet",
  welcome: "Welcome to my little world", categories: "Categories",
  footerNote: "Leaving a trace of what I love.", designReferenceBefore: "Design inspired by", designReferenceAfter: "", lastUpdated: (date) => `Last updated ${date}`,
  appearance: "Appearance", themeLight: "Light mode", themeSystem: "Follow system", themeDark: "Dark mode",
  shareErrorHelp: "Copy failed. Please copy the URL from the address bar.", shareDescription: "Copy the post title, summary, and link", copied: "Copied", copyFailed: "Copy failed", shareText: "Share text",
  code: "Code", codeCopied: "Code copied", codeCopyFailed: "Copy failed. Please select and copy the code.", disableCodeWrap: "Disable code wrapping", enableCodeWrap: "Enable code wrapping", disableWrap: "Disable wrapping", wrap: "Wrap lines", copyCode: "Copy code",
  codeLines: (count) => `${count} ${count === 1 ? "line" : "lines"} of code`, collapseCode: "Collapse code", expandCode: "Expand code", codeStats: (lines, characters, bytes) => `${lines} lines · ${characters} characters · ${bytes} bytes`,
  image: "Image", imageUnavailable: "Image could not be loaded", articleImage: "Article image", enlargeImage: (alt) => `Enlarge image: ${alt}`, viewImage: "View article image", closeImage: "Close image",
  backToTop: "Back to top", tableOfContents: "Contents", articleSections: "Article sections", noSections: "This post has no sections", openContents: "Open table of contents", closeContents: "Close table of contents",
  technicalInfo: "Technical information", buildPlatform: "Build platform", imageStorage: "Image storage", softwareLicense: "Software license", contentLicense: "Content license", canonicalDomain: "Canonical domain", unspecified: "Not specified", selfHosted: "Self-hosted", expandBuild: "Show build details", collapseBuild: "Hide build details",
};

const ja: Messages = {
  posts: "記事", archives: "アーカイブ", about: "このブログについて", home: "ホーム",
  mainNavigation: "メインナビゲーション", navigationMenu: "ナビゲーションメニュー", openNavigation: "ナビゲーションメニューを開く", closeNavigation: "ナビゲーションメニューを閉じる",
  avatar: (name) => `${name}のアバター`, siteHome: (name) => `${name}のホーム`,
  sidebarNote: ["自分のペースで、", "日々を物語に。"], email: "メール", rss: "RSS を購読", aboutSite: "このブログについて",
  searchArticles: "記事を検索", searchPlaceholder: "記事・カテゴリー・タグを検索…", searchKeywords: "検索キーワード", closeSearch: "検索を閉じる",
  searchCount: (count) => `${count} 件の記事が見つかりました`, searchPrompt: "読みたい記事を見つけよう", searchEmpty: "見つかりませんでした", searchRetry: "別のキーワードで試してみてください。",
  searchFields: "タイトル · 概要 · カテゴリー · タグ", close: "閉じる",
  articleList: "記事一覧", articleCategories: "記事のカテゴリー", allArticles: "すべての記事", allCategories: "すべてのカテゴリー", wordCount: (count) => `${count} 文字`, postCount: (count) => `${count} 件`, clearTag: "タグの絞り込みを解除",
  readingMinutes: (count) => `${count} 分`, noArticles: "まだ記事がありません", noArticlesHint: "別のカテゴリーをご覧ください。物語は続きます。", browseArticles: "すべての記事を見る",
  pagination: "記事のページ切り替え", previousPage: "前のページ", nextPage: "次のページ", feedFootnote: "少しずつ書いて、少しずつ積み重ねる。",
  featuredArticles: "おすすめ記事", carousel: "カルーセル", carouselKeyboard: "おすすめ記事。左右の矢印キーで切り替えます", previousFeatured: "前のおすすめ記事", nextFeatured: "次のおすすめ記事",
  blogStats: "ブログ統計", operatingTime: "運営期間", lastBuild: "最終更新", totalWords: "総文字数",
  trafficStats: "アクセス統計", totalPageViews: "累計閲覧数", totalVisitors: "累計訪問者数",
  pageViewsDescription: "ページの累計閲覧数（PV）。繰り返しの閲覧も含みます。", visitorsDescription: "ブラウザーの Cookie に保存した訪問者 ID で重複を除いた訪問者数（UV）。Cookie の削除やブラウザーの変更で新規訪問者と数えられる場合があり、正確な人数ではありません。",
  topCountries: "国別アクセス Top 3", topCountriesDescription: "国を特定できたアクセスを累計閲覧数（PV）の多い順に表示します。", noCountryData: "国別データはまだありません",
  welcome: "私の小さな世界へようこそ", categories: "カテゴリー",
  footerNote: "好きなことの足跡を残す。", designReferenceBefore: "", designReferenceAfter: "をデザインの参考にしています", lastUpdated: (date) => `最終更新：${date}`,
  appearance: "外観設定", themeLight: "ライトモード", themeSystem: "システムに従う", themeDark: "ダークモード",
  shareErrorHelp: "コピーできませんでした。アドレスバーから URL をコピーしてください。", shareDescription: "記事のタイトル・概要・リンクをコピー", copied: "コピーしました", copyFailed: "コピーできませんでした", shareText: "テキストで共有",
  code: "コード", codeCopied: "コードをコピーしました", codeCopyFailed: "コピーできませんでした。コードを選択してコピーしてください。", disableCodeWrap: "コードの折り返しを無効にする", enableCodeWrap: "コードの折り返しを有効にする", disableWrap: "折り返しを無効にする", wrap: "行を折り返す", copyCode: "コードをコピー",
  codeLines: (count) => `${count} 行のコード`, collapseCode: "コードを折りたたむ", expandCode: "コードを展開", codeStats: (lines, characters, bytes) => `${lines} 行 · ${characters} 文字 · ${bytes} バイト`,
  image: "画像", imageUnavailable: "画像を読み込めませんでした", articleImage: "記事の画像", enlargeImage: (alt) => `画像を拡大：${alt}`, viewImage: "記事の画像を表示", closeImage: "画像を閉じる",
  backToTop: "先頭に戻る", tableOfContents: "目次", articleSections: "記事のセクション", noSections: "この記事には目次がありません", openContents: "目次を開く", closeContents: "目次を閉じる",
  technicalInfo: "技術情報", buildPlatform: "ビルド環境", imageStorage: "画像ストレージ", softwareLicense: "ソフトウェアライセンス", contentLicense: "記事のライセンス", canonicalDomain: "正規ドメイン", unspecified: "未指定", selfHosted: "セルフホスト", expandBuild: "ビルド情報を表示", collapseBuild: "ビルド情報を隠す",
};

const messages: Record<Locale, Messages> = { zh, en, ja };

export function getMessages(locale: Locale) {
  return messages[locale];
}
