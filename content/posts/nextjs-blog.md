---
title: 用 Next.js，搭一个自己的小世界
description: 从 Markdown 写作到三语阅读，记录这个 Next.js 博客的内容结构、页面实现与阅读体验。
date: 2026-09-30
category: 技术
tags: Next.js, React, 博客
cover: /images/posts/nextjs-blog/wallhaven-y8137x.jpg
coverPosition: top
featured: true
---

互联网有很多可以发布内容的地方，但一个属于自己的博客，仍然有它特别的意义。技术笔记可以慢慢修订，年终总结可以按年份翻阅，页面也可以长成自己喜欢的样子。

Altria 目前保留这篇建站记录和三篇年终总结。下面从这个仓库的实际实现出发，说明文章怎样变成页面，以及哪些阅读能力已经具备。**先让内容有一个稳定的家，再逐步改善写作和阅读。**

## 设计参考与致谢

本站的页面布局与视觉样式参考了以下网站和开源项目，并在 Next.js / React 中进行复刻与适配：

- [信也のブログ](https://blog.shinya.click/)：作者 [senshinya（信也）](https://github.com/senshinya)。
- [纸鹿摸鱼处](https://blog.zhilu.site/)：对应的开源项目 [L33Z22L11/blog-v3](https://github.com/L33Z22L11/blog-v3)（Clarity）。

感谢两位作者公开分享设计与实现。Altria 在这些设计参考的基础上，保留自己的站点资料与文章内容，并围绕当前 Next.js 项目实现页面、内容读取与交互。

## 一、用简单的结构承载内容

项目使用 Next.js 16.3.7、React 19.3.0 和 TypeScript，采用 App Router。文章保存在 Markdown 文件中，站点配置放在 `blog.config.ts`，目前没有数据库和内容管理后台。内容和代码都可以用 Git 查看差异、回退版本，不必为了发布几篇文章先维护另一套系统。

```text
app/(zh)/                 中文首页、归档和文章路由
app/[locale]/             英文、日文路由
app/_pages/               各语言共用的页面实现
content/posts/            中文 Markdown
content/posts/en/         英文译文
content/posts/ja/         日文译文
lib/posts.ts              读取文章、校验元数据、关联译文
lib/markdown.ts           解析正文和标题锚点
components/               阅读、搜索、主题等组件
blog.config.ts            站名、作者、域名等配置
```

这套结构把两种改动分开：写文章主要改 `content/posts`，改阅读体验主要改组件和样式。新文章不需要再复制一份页面组件，已有文章也不会因为换封面就换掉地址。

## 二、从一份 Markdown 开始写作

每篇文章由开头的元数据和后面的正文组成。以当前文章为例，基本格式如下：

```markdown
---
title: 用 Next.js，搭一个自己的小世界
description: 记录博客的内容结构、页面实现与阅读体验。
date: 2026-09-30
category: 技术
tags: Next.js, React, 博客
cover: /images/posts/nextjs-blog/wallhaven-y8137x.jpg
featured: true
---

## 从内容开始

这里写正文，用 **加粗** 强调重点。
```

frontmatter 现在使用 YAML 解析器，支持数组、嵌套对象、多行简介和引号转义；旧的单行字段与逗号分隔标签仍可继续使用。日期可以写成有效的 `YYYY-MM-DD`、`YYYY-MM-DD HH:mm:ss` 或 ISO 时间，归档保留原始日期。`featured: true` 表示可进入精选区，`cover: false` 可以关闭封面，`draft: true` 会让文章在开发和生产环境都退出公开内容清单。

上游格式中的 `categories` 分类路径、`image` 封面、`recommend` 推荐标记、`published`／`updated` 时间也能读取。可用 `seoTitle`／`seoDescription` 或 `seo` 对象单独提供搜索摘要，以 `references` 写参考链接，以 `authorship` 明确声明创作方式。许可由文章或站点实际填写，不为旧文自动授权；`permalink` 也不会改掉已有文章地址。

文件名决定 slug：`nextjs-blog.md` 对应 `/posts/nextjs-blog`。中文文章默认使用中文语言标识；标题可以修改，文件名最好保持稳定，因为外部收藏和分享依赖这个 URL。

正文除标题、段落、列表、引用、链接、图片、表格和围栏代码外，还支持任务列表、删除线、脚注、引用式链接、硬换行和数学公式。MDC 语法可以插入提醒、折叠、选项卡、卡片、诗歌、聊天、时间线等预设组件，Mermaid 与 ABC 围栏分别绘制图表和乐谱。可复制的写法集中在仓库的 `docs/markdown-examples.md`，普通文章仍能只写 Markdown。

HTML 只允许白名单内的排版元素和安全属性，不执行脚本、事件处理器或模板表达式；任意 iframe 和 JSX 也不会直接执行。视频使用专门的组件与受限来源。GitHub 卡片只查询明确指定的公开仓库，Iconify 只加载显式图标；网络失败保留链接或说明。乐谱只有点击播放才发声，外部音色不可达时仍可读谱和查看源码。

## 三、让服务端读取文章，让浏览器处理交互

`lib/posts.ts` 在服务端读取文件，先排除草稿、无效日期和语言不匹配的记录，再生成文章列表。首页、归档、详情和订阅源使用同一套内容入口，可以减少“列表里删了，其他地方还留着”的不同步。

中文详情路由使用 `generateStaticParams` 列出构建时需要生成的文章。页面的关键部分是：

```tsx
import Content from "@/app/_pages/post";
import { getPosts } from "@/lib/posts";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPosts().map(({ slug }) => ({ slug }));
}

export default async function Page({ params }: Props) {
  return <Content slug={(await params).slug} locale="zh" />;
}
```

这里要注意当前 Next.js 的路由参数是 Promise，需要先读取它。构建会预生成已知文章，找不到的文章通过 `notFound()` 返回 404；静态生成文章也不等于整个项目已经配置成纯静态导出。修改内容后，正式站点仍需要重新构建并发布。

搜索框、主题切换、分类筛选、目录跟随、代码复制和图片灯箱需要浏览器事件或状态，才放进 Client Components。文件读取和正文解析留在服务端。`"use client"` 是模块边界，放在具体交互组件上，更容易控制客户端需要下载的代码。可以对照 [Server 与 Client Components 文档](https://nextjs.org/docs/app/getting-started/server-and-client-components) 和 [generateStaticParams 文档](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) 理解这部分。

## 四、把阅读体验落在细节上

文章页的封面、摘要和正文各有自己的位置。正文宽度、行距和手机留白决定长文是否读得下去；图片再好看，也不能挤占标题和内容的空间。

目前的目录来自正文标题，使用与标题一致的锚点，滚动时会标记当前章节。桌面端可以在侧栏跳转，窄屏使用目录抽屉，顶部还有阅读进度。标题改动可能改变锚点，因此已经被外部引用的章节标题也值得谨慎调整。

代码块使用 Shiki 按需加载语言并适配明暗主题，支持复制、折行、缩进导线和长代码折叠。超过 32 行默认收起至 16 行，可用围栏的 `wrap`、`expand`、`indent=2` 调整；差异、重点、聚焦和错误提示通过 Shiki 注释标记。复制的是原始代码，不包含显示出来的行号；未知语言或高亮失败时仍显示源码。

正文图片延迟加载，点击可以放大；连续的纯图片段落会自动根据横竖比例分行，桌面每行最多 4 张，手机最多 2 张，保持阅读顺序和原始比例。文字、标题或分隔线可以分开两组图片。加载失败时保留说明文字，因此写图片的 `alt` 也是在慢网络、失效链接和辅助阅读场景下传达内容的办法。

## 五、让搜索、译文和订阅保持诚实

现在的站内搜索匹配标题、摘要、分类和标签，忽略大小写，并使用连续字符串包含判断。可以用 `⌘ K` 或 `Ctrl K` 打开搜索。**它还不是正文全文搜索**，不会因为某句话只出现在文章中段就搜到，也没有章节命中、模糊纠错或搜索相关度排序。文章多起来以后，再考虑从正文生成分节索引。

语言界面和文章翻译是两件事。这篇文章有实际维护的英文、日文文件，通过 `translationKey: nextjs-blog` 关联。中文地址保持原样，译文地址是 `/en/posts/nextjs-blog` 和 `/ja/posts/nextjs-blog`；没有译文的文章不生成假页面，也不会临时调用翻译服务。

标题、描述、canonical、Open Graph 和结构化数据由文章与站点配置生成；语言替代链接只列出真实译文。`/sitemap.xml` 帮助发现页面，`/rss.xml` 以及对应语言的 Feed 提供标题、摘要和原文链接，当前并非全文订阅。上线前必须配置正式的 `NEXT_PUBLIC_SITE_URL`，否则复制链接和搜索引擎元数据可能仍指向本机。相关机制可以查看 [Next.js 元数据文档](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)。
