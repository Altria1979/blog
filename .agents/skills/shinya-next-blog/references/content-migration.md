# 内容迁移规则

当前任务创建 Skill，不修改博客 schema、类型导出、API 或路由。以下是后续实现的迁移约定与源码依据；将当前代码事实和拟新增能力分开。范围见 [SKILL.md](../SKILL.md)，行为清单见 [feature-map.md](feature-map.md)，验证见 [acceptance.md](acceptance.md)。

## 当前管线与文章模型

**本地确认，2026-09-30**：`lib/posts.ts` 从 `content/posts/*.md` 按文件名生成 slug；逐行解析简单 frontmatter，tags 是逗号列表，category 是单字符串，date 必须有效 `YYYY-MM-DD`。`draft:true` 在开发/生产都过滤。cover 缺失时强制补 `/images/sea.jpg`，尚不能表达无封面文章。`Post` 含 title/description/date/category/tags/cover/featured/readingMinutes/wordCount/content；正文通过 `lib/markdown.ts` 的受控 AST 在 `components/markdown.tsx` 渲染。危险 URL 和原始 HTML 已有安全回归，标题 ID 已稳定去重。

**源码确认**：[content.config.ts](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/content.config.ts) 定义分语言 Markdown、SEO、date/published、categories、tags、tech/story、authorship、image、recommend、references、draft、permalink、readingTime；[article.ts](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/types/article.ts) 增加 path 和可选封面/布局元信息。

| 现有字段/行为 | 后续规范与兼容 |
| --- | --- |
| slug / `/posts/{slug}` | 保留现有稳定 ID 与 canonical。把正式访问路径和内容文件路径分开；新 permalink 可选，不能让它静默改变既有文章 URL。 |
| title / description | 保持现有回退规则，SEO title/description 可独立覆盖，不改卡片标题来迁就搜索引擎。 |
| date | 保留既有有效日期。源站 date 用作创建日期，published 是独立发表日期；不要把 published 当更新时间。源码 Feed 的 entry updated 取 date、published 取 published 或 date，站点 updated 才取 buildTime。先明确排序/归档/展示的日期语义，不能改 date 为更新时间破坏既有排序。 |
| category | 旧字符串规范化为一层 categories；源站数组表示祖先→子类路径，不是平行分类集合。首页仅取第一层，统计构建分类树；tags 继续表示独立标签。 |
| cover | 可映射源站 image 概念，但保持现有字段兼容与用户素材；无图文章支持无图头部，不能强制添上作者封面。 |
| featured | 旧 true 保持精选资格；新增 recommend 数字用于排序。不要伪称现有布尔已支持原站推荐权重。 |
| readingMinutes / wordCount | 对规范化正文派生；保持现有计数行为的回归，变更算法时重新检查所有展示与总数，不把三份译文累加为三篇原文。 |
| 无排版字段 | 引入受控 tech/story 语义映射，为技术和叙事内容选择不同字体/排版，旧内容保持当前可读行为。 |
| 无 refs / authorship | 引用使用实际 title/link；上游声明枚举为 human-only、human-ai-polished、ai-human-reviewed、ai-only，译文保留原作声明。旧内容未声明时不自动宣称 human-only，更不能自动推断作者身份。 |
| 无 locale / 译文关联 | 旧文章为 zh；新增 locale 与稳定译文组标识，组内仅列真实文件。可选译文不会改变原作 URL 或覆盖其内容。 |

这是能力映射，不要求把 Nuxt 的字段或依赖原样搬入 Next。扩展解析器时显式处理数组/嵌套 frontmatter，不能继续用逐行字符串解析伪装完整 YAML；新依赖须遵守项目约束，未经明确请求不安装。

系列采用用户自己的显式文章路径顺序；[articleSeries.ts](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/utils/articleSeries.ts) 是源码依据。普通邻接推荐仍沿文章排序；同分类不自动成为系列。不复制作者的系列主题、文章或路径集合。

## 公共内容清单与数据流

**源码确认**：[publication/sources.ts](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/modules/publication/sources.ts) 在内容处理前排除生产草稿和 previews，游记过滤后才序列化，避免私有内容进入公开产物。

后续 Next 数据流应为：

```text
本地文章/译文/游记源
  → 解析元数据并按环境建立允许发布的输入清单
  → 规范化数据与受控正文 AST
  → 页面、预渲染、搜索章节索引、Feed、SEO、统计
```

生产清单排除 `draft:true`、预览目录和草稿游记；正文出现文字 `draft:true` 不是元数据。不要先全量导入到客户端再仅隐藏列表。开发预览可保留私有内容，但其公开路由、构建和索引必须与生产分开验证。沿用当前非法日期、路径查询、危险 URL、HTML 转义与重复标题 ID 用例。

## 三语与路由

**源码确认**：[useLocaleAlternates.ts](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/composables/useLocaleAlternates.ts)、[i18n manifest](https://github.com/senshinya/blog/tree/6dac6683dbd0e9c9a921a7790086a44696d43910/modules/i18n-manifest)、[LangToggle.vue](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/blog/LangToggle.vue) 由真实译文清单控制切换与 SEO；偏好检测不覆盖 URL 的语言。

- 中文保持当前路径。启用对应界面时，英文/日文使用 `/en`、`/ja` 前缀与 zh/en/ja 数据标识，保持页面语义和已存在状态。
- 应用页的界面译文与文章译文分别维护。三语按钮存在不代表所有文章都有翻译；文章仅为真实译文建立页面和 hreflang，缺译文按钮不可激活。
- 不把同一中文正文复制到三条路由，不默认运行时调用翻译服务。译文创建属于实际内容工作，不能以空壳页面交付。
- 保留 `/posts/…`、`/archives`、`/about`、`/rss.xml`。`/links` 按用户要求移除，不保留或创建友链别名。源站 `/archive`、`/friends`、泛型文章路径是研究事实，不替换用户路径；当前启用模块确需新增别名时明确重定向并保持当前 canonical。
- 原站页码路径和旧 query redirect 不能直接套用当前 query 约定。保留有效链接，先确定 query/page 路由兼容再改；不存在文章和无效分页仍真实404。

## 正文与组件映射

**源码确认**：[content 目录](https://github.com/senshinya/blog/tree/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/content)、[remark plugins](https://github.com/senshinya/blog/tree/6dac6683dbd0e9c9a921a7790086a44696d43910/remark-plugins)、[nuxt.config.ts](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/nuxt.config.ts)。Nuxt MDC 的组件/slot/属性语法不等于 React MDX。现有普通 Markdown 不能直接接收这套语法。

迁移优先保留受控 AST，建立允许的 React 组件映射及受限属性。若未来采用 MDX，先明确内容作者信任边界、格式转换与兼容，不能把任意用户文本当可执行 JSX。创建 Skill 不引入 MDC/MDX、Shiki、搜索、地图或图表库。

| 源组件或能力 | React 内容语义/启用方式 |
| --- | --- |
| 标准 Markdown 标题/段落/列表，以及 ProseA / ProseTable / ProseCode | 延续基础 AST 和标题 ID；所有链接协议校验，普通 Markdown 兼容。标准 prose 由 Nuxt 内容系统提供，不能把 H1–H6/P 误写成本仓库自定义组件。 |
| ProsePre | 代码文本与 info/meta 分离，受控语言、文件名、diff/highlight 信息；高亮、复制、wrap、折叠见下。 |
| ProseImg / Pic | 安全图片地址、尺寸/占位、alt/caption 和灯箱；不能沿用作者图床专属变换。 |
| Alert / Tip / Quote / Poetry / MdTitle | 类型化提示、引用与标题/诗歌排版；现有引用可直接增强，组件按实际内容逐项接入。 |
| Folding / Tab | 受控折叠与标签页组，保留内容顺序和键盘语义；不要简单丢弃 slot 内文字。 |
| CardList / LinkCard / LinkBanner / FeedCard / FeedGroup / Github | 链接/站点资料卡片或组，数据可来自文章/配置。缺少外部元信息时保留普通链接，先满足本地数据，不默认添加抓取 API。 |
| Badge / Blur / Copy / Key / EmojiClock | 徽章、隐藏文本、复制、键帽、时钟类受控行内表达；没使用的组件记录能力，不为完成目录制造页面。 |
| Chat / Timeline | 聊天样式与时间轴条目/顺序；实际内容需要时迁移结构化字段。 |
| Mermaid / KaTeX 数学 | 图表/数学按实际文章需要开启；库或渲染不可用时保留源文本，不能假装完整支持。 |
| MusicScore / VideoEmbed | 乐谱/音频及视频嵌入按用户实际文章需求评估；受限来源与语义降级，不引入作者账号或未配置播放服务。 |

这是源码能力目录，不是要求给所有特殊组件制造样例。实施某篇文章时记录“已实现／需要实现／未使用”，确保未实现组件的文字不丢失，不能只渲染占位壳。

### 代码与图片

[ProsePre.vue](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/content/ProsePre.vue) 的能力包括视口附近高亮、明暗主题、复制/折行、行号/缩进、超过32行折为16行。无高亮时始终显示已转义纯文本；复制原始代码，不复制行号或折叠标记。保留文件名与合法语言元数据。32/33行、加载失败和 reduced-motion 必须实测。

[img.ts](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/utils/img.ts)、[gen-image-meta.ts](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/scripts/gen-image-meta.ts) 给图像派生尺寸/颜色占位。用户本地图片也应建立元数据，未取得尺寸时不能伪造。正文图片懒加载、最大高度/题注/单图灯箱按视觉规范迁移，加载失败仍保留 alt。上游 Cloudflare 变换与作者 zone 绑定，不能把相同 URL 拼接法当通用图床方案。

## 正文分节索引

**源码确认**：[Search.vue](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/popover/Search.vue) 使用章节索引、MiniSearch 的前缀/模糊/AND与字段权重、locale `Intl.Segmenter`、100ms 防抖；不索引 `pre` 代码内容。

索引配置实际为 `fields: ['title', 'content']`、`storeFields: ['title', 'titles', 'content', 'level']`、`boost: {title: 3, titles: 2}`。`titles` 不在索引字段内，不能仅凭 boost 声称祖先标题被检索或加权；该行为标为待验证。后续若把祖先标题新增为检索字段，明确记录为行为修正，并增加只出现在祖先标题里的词的用例。

后续从相同公开正文 AST 派生章节记录：稳定文章 ID/正式路径、locale、文章标题/摘要、章节标题与层级面包屑、对应 headingId 和可搜索正文。标题前的引言也应可搜索。复用正文渲染生成的 headingId，不能在索引端单独算法造成定位错位。代码节点不进入章节正文；富组件里的实际文字按语义提取，而非索引 JSX/MDC 源码。

按语言构建并按需加载索引，草稿在输入阶段已排除。把缺失索引、加载失败、空查询和无结果区分清楚。搜索库尚未选择/安装；实现需达到记录的检索行为，不能以当前 includes 简化冒充。排序、高亮、键盘选择与原文锚点用实际文章验证。

## 游记结构

**源码确认**：[travel.ts](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/types/travel.ts)、[游记详情](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/pages/travels/%5Bslug%5D.vue)、[Map.vue](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/travel/Map.vue)。源数据为 YAML；后续可选择项目已有解析能力可安全支持的本地格式，保持语义：

```text
Travel: slug, draft?, title, subtitle, posttitle, description,
        published, totaldays, coverImage, days[]
TravelDay: day, title, descriptions[], photos[]
TravelPhoto: src, alt, caption?, lat?, lng?
```

`day` 是旅行第几天，从0可表示出发前夜；它不是数组下标，同一天可以有多个章节。照片坐标可缺失，不能因无坐标丢弃内容。总天数不由章节数量推算，章节和照片顺序按真实内容维护。

章节、照片与地图焦点联动；键盘、滚轮/触摸和移动折叠地图分别验证。源站使用 MapLibre/CARTO，不需要把它们写成用户已安装/已配置。缺 WebGL 或地图网络时仍展示行程文字与照片。当前没有用户结构化行程，保留诚实空态，不复制作者游记或生成虚假个人经历。

## 统计、Feed、SEO 与最小接口

**源码确认**：[stats.get.ts](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/server/api/stats.get.ts) 以中文原文产生总数、年度数、分类树和标签；参考接口形状是：

```text
{ total: { posts, words },
  annual: { [year]: { posts, words } },
  categories: [{ name, posts, children? }],
  tags: string[] }
```

后续优先构建时生成统计，不需要数据库。是否公开 `/api/stats` 由实际调用需求决定，创建 Skill 不增加该接口。原文唯一计数；运营时长由用户建站时间，最近更新由真实构建/部署时间，版本来自实际环境，不抄作者数值和平台标签。

[feed.ts](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/server/utils/feed.ts) 的 Atom最多50篇，输出摘要/封面/阅读全文链接，不是完整正文。保持现有 `/rss.xml`，真实译文可增加 `/en/atom.xml`、`/ja/atom.xml` 及默认 `/atom.xml`；友链相关 OPML 不迁移。Feed、sitemap、canonical、Article/Person JSON-LD及 alternates 共享发布清单和用户正式域名；XML/JSON-LD继续安全转义。

原站 [og.get.ts](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/server/api/og.get.ts) 为外站元信息代理，带超时/跳转/体积限制，但其实现不是无残余风险的 SSRF 模板。当前启用模块可先用本地链接资料，不默认增加此运行时 API；确有需求时再设计 Next Node runtime、目标与连接校验、重定向限制及失败降级，不照搬作者服务。

## 资源与待验证事项

软件 [LICENSE](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/LICENSE) 为 MIT；文章另有 [LICENCE-CC-BY-NC-SA](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/LICENCE-CC-BY-NC-SA)。字体、封面、截图和其他图片来源分别核对许可；本文不授权把研究素材部署为用户产品。

保留用户自己的站名、作者、内容、素材及当前启用模块的有效 URL；不要继承作者生日、头像、友链清单、Memos/Bangumi/comment 身份、统计 token 或图片变换服务。友链及原有参考友链说明按用户要求移除，不因内容迁移重新引入。

待验证：当前正文实际使用了哪些增强能力、准确的资源许可、用户译文/行程是否新增、最终依赖选择及增强后的公开产物。沿用 source pin；上游升级或本地字段变化后更新相关映射并重新验收。
