# 功能差距矩阵

## 依据与范围

调研日期：2026-09-30。参考 [senshinya/blog 固定版本 6dac6683dbd0e9c9a921a7790086a44696d43910](https://github.com/senshinya/blog/tree/6dac6683dbd0e9c9a921a7790086a44696d43910)，项目为 Clarity 3.8.0 / Nuxt + Vue。当前本地为 Next 16.3.7 / React 19.3.0，内容目录有 6 篇文章；这些数量和本地差距是此次快照，后续使用前重新检查。

- **源码确认**：以下参考行为已从固定版本的组件/模块确认，不等同于本地实现或源站所有交互都已手动验证。
- **在线观察**：在线站点的首页、归档、友链、游记入口及中英日/主题控件存在，字体加载与组件结构可观察。独立使用测试在 1280×720、DPR=2 观察首页与第二页，第二页精选消失；这不等同于完整交互验收。在线站点并未证明部署的是固定版本。
- **待验证**：具体浏览器交互、故障态、无障碍、性能及参考截图的规范视口仍需按 [验收规则](acceptance.md) 实测。

当前启用文章首页/阅读、正文搜索、归档、游记、三语界面与真实译文关联、主题、Feed/SEO/统计。保留 Altria 资料、现有内容与关于页。友链按 2026-10-01 用户要求移除；评论、碎语、娱乐收藏暂缓。它们属于有意范围差异，不计为本轮缺陷，也不显示占位入口。

## 启用功能

下表“参考行为”均为源码确认；“差距与通过条件”描述后续工作，不表示创建 Skill 时已完成。

| 能力 | 参考行为与固定源码 | 当前本地 | 差距与通过条件 |
| --- | --- | --- | --- |
| 首页精选 | 按推荐权重排序；循环轮播、拖动、触摸、横向滚轮/Shift+滚轮；只在未筛选第一页显示。[Slide.vue](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/post/Slide.vue)、[index.vue](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/pages/index.vue) | `app/page.tsx` 的精选配滚动容器；`featured` 是布尔值，不随列表状态隐藏。 | 完整交互与显示条件一致；hover/focus 信息、遮罩及比例见视觉规范。静态三张卡片不算循环轮播。 |
| 分类/分页 | 顶层分类 dropdown；选择后关闭、重置页码；每页10篇；底部 sticky 胶囊随列表末端可见性展开。[Filter.vue](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/post/Filter.vue)、[Pagination.vue](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/partial/Pagination.vue)、[app.config.ts](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/app.config.ts) | `components/article-feed.tsx`：分类 tabs、标签和 query 筛选，每页5篇、普通分页。 | dropdown、10篇分页、状态恢复及精选联动；无效页码/无结果行为明确，分页不遮住移动控件；不擅自删除当前有效标签链接。 |
| 侧栏/移动导航 | 三栏 sticky；1080px 右栏转抽屉，768px 左栏也转抽屉；浮动开关、遮罩和页脚边界。[default.vue](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/layouts/default.vue)、[BlogPanel.vue](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/blog/BlogPanel.vue) | `app/globals.css`、`components/sidebar.tsx`：右栏1180px隐藏，手机为顶部横向导航。 | 两侧内容在窄屏仍可达；抽屉、遮罩、焦点和浮动按钮均验证。不能直接隐藏阅读目录。 |
| 阅读结构/目录/进度 | 叠字头图、tech/story、右栏层级目录/当前位置、正文区间进度。[PostHeader.vue](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/post/PostHeader.vue)、[Toc.vue](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/widget/Toc.vue)、[Progress.vue](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/post/Progress.vue) | `app/posts/[slug]/page.tsx`：标题后独立图片、白色正文卡、文内 details 目录；右侧仍是首页 widgets。 | 头图/无图、两种排版、侧栏目录及移动入口；正文进度排除页脚；无 scroll-timeline 时使用参考的隐藏降级。 |
| 文章关系/分享/许可 | 显式系列或普通前后文章；分享组合文本、参考资料、许可和作者声明。[articleSeries.ts](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/utils/articleSeries.ts)、[PostFooter.vue](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/post/PostFooter.vue)、[PostHeader.vue](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/post/PostHeader.vue) | 普通邻接卡、标签、感谢文字，分享仅链接；无显式系列/声明字段。 | 不用分类推断系列；仅展示实际资料/准确声明；复制站名、标题、摘要及用户正式 URL。 |
| 代码 | 视口附近 Shiki 高亮、纯文本降级；文件名/语言、复制/折行、行号/缩进/diff；超过32行折为16行。[ProsePre.vue](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/content/ProsePre.vue) | `components/markdown.tsx` 的原生 pre/code。 | 32/33行边界、复制原文、wrap/横滚、明暗高亮和失败降级；不要把整套高亮库无条件塞入首屏。 |
| 图片 | 尺寸/占位元数据、懒加载、点击单个 target 灯箱、题注。[ProseImg.vue](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/content/ProseImg.vue)、[img.ts](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/utils/img.ts)、[Lightbox.vue](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/popover/Lightbox.vue) | Markdown 原生图片，没有正文灯箱/尺寸占位。 | 避免加载位移，正确题注、关闭/焦点返回；该 wrapper 未提供图集前后导航，不凭空要求这项。 |
| 富内容 | MDC 组件、数学、图表、时间轴、折叠/Tab/链接卡等。[content 组件目录](https://github.com/senshinya/blog/tree/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/content)、[nuxt.config.ts](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/nuxt.config.ts) | 自有安全 Markdown AST：标题、段落、行内格式、链接、图、引用、列表、表格等。 | 对实际文章所用组件建立受控 React 映射，保持安全解析；冷门组件按内容需求开启。Nuxt MDC 与 MDX 不兼容，详见迁移规则。 |
| 正文搜索 | 分章节正文索引，排除代码；前缀/模糊、AND/字段权重、按语言分词、100ms防抖；高亮、章节面包屑/锚点、选中文本与键盘操作。[Search.vue](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/popover/Search.vue)、[SearchItem.vue](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/popover/SearchItem.vue)、[search store](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/stores/search.ts) | `components/search-dialog.tsx`：title/description/category/tags 的 includes；有 Cmd/Ctrl+K 与 Esc。 | 仅在正文出现的词应命中章节并可定位；保留现有快捷键；增加结果选择/Enter 与加载错误处理；标题筛选不能标作全文搜索。 |
| 归档 | 年份/分类、数量/字数、可选年龄、悬浮预览、间距/列数密度调节。[archive.vue](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/pages/archive.vue)、[ArchivePreview.vue](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/post/ArchivePreview.vue) | `app/archives/page.tsx`：按年文章列表。 | 按真实文章生成筛选与统计、预览及密度；用户未配置生日时不显示年龄。保留 `/archives`。 |
| 游记 | 独立全屏叙事、章节/照片/坐标、当前章节联动地图、键盘/滚轮/触摸、移动折叠地图与 WebGL 降级。[travel types](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/types/travel.ts)、[游记详情](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/pages/travels/%5Bslug%5D.vue)、[Map.vue](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/travel/Map.vue) | 尚无独立游记模块；一篇旅行题材文章不等于这套体验。 | 使用用户行程，缺数据为诚实空态；章节/图/地图联动及网络失败可读；地图提供方与库单独按项目约束评估，不复用作者行程。 |
| 三语/主题 | zh/en/ja UI 与独立译文；URL 为语言权威、偏好只建议；缺译文禁用，真实 hreflang；light/system/dark。[LangToggle.vue](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/blog/LangToggle.vue)、[LocaleSuggestion.vue](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/blog/LocaleSuggestion.vue)、[useLocaleAlternates.ts](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/composables/useLocaleAlternates.ts)、[ThemeToggle.vue](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/blog/ThemeToggle.vue) | 2026-10-01 已实现三语界面、`/en`/`/ja` 路由、6 篇示例文章的12份真实译文与共享发布清单；中/En/あ 和三态主题胶囊合并。 | 合并语言/主题胶囊；系统变化、持久化、首次 hydration 一致；无译文禁用，不能把中文文章复制三份作为翻译。 |
| 首页统计/技术信息 | 建站时长、最近构建时间、总字数；构建平台/图片存储/许可/域名及可展开版本信息。[BlogStats.vue](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/widget/BlogStats.vue)、[BlogTech.vue](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/widget/BlogTech.vue)、[stats.get.ts](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/server/api/stats.get.ts) | `components/info-sidebar.tsx`：文章数、分类数、字数，以及关于/分类/标签/版权。 | 当前右栏为统计→技术信息；真实时间与版本，不显示未使用的 R2/Vercel 或 Nuxt/Vue；总字数不按译文倍增。 |
| Feed/SEO | 三语 Atom、最多50篇摘要/封面/全文链接与 XSL；OPML、canonical、真实译文 alternates、Article/Person、sitemap/robots/llms。[feed.ts](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/server/utils/feed.ts)、[服务端 routes](https://github.com/senshinya/blog/tree/6dac6683dbd0e9c9a921a7790086a44696d43910/server/routes)、[articleSeo.ts](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/utils/articleSeo.ts) | 三语 RSS、真实译文 canonical/hreflang、sitemap 与 JSON-LD 已实现；robots 保留。 | 保留 RSS，补适用语言 Atom/SEO；友链相关 OPML 不迁移；域名来自当前配置；不发布草稿、不存在译文或假的社交账号。 |
| 发布安全/404 | 生产输入排除草稿与 previews；游记先过滤后生成；无效内容/页码真实404。[publication sources](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/modules/publication/sources.ts)、[publication module](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/modules/publication/index.ts) | `lib/posts.ts` 已过滤 draft/非法日期；当前开发也隐藏草稿；已知 slug 查询与 notFound，已有内容回归测试。 | 扩展模型/索引后仍从公开输入排除；开发预览单独定义；生产包、feed/index均无草稿，404直接打开与站内导航无 hydration 错误。 |

## 已移除模块

友链按用户要求移除，不保留 `/links` 页面、导航、配置、专用样式或 sitemap 条目；除非用户明确重新启用，后续对齐不恢复友链资料、申请说明或 OPML。

**历史源码确认，仅供研究**：参考站有分组/组内随机、卡片 hover 资料及技术图标、站点信息复制、申请说明、OPML，见 [friends.vue](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/pages/friends.vue)、[FeedCard.vue](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/content/FeedCard.vue)、[subscriptions.opml.get.ts](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/server/routes/subscriptions.opml.get.ts)。这些能力不属于当前本地差距或通过条件。

## 暂缓模块

| 模块 | 源码事实 | 当前规则 |
| --- | --- | --- |
| 评论/互动 | 当前是独立评论后端，并非 giscus；[comment 组件](https://github.com/senshinya/blog/tree/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/comment)。 | 不做评论、reaction、登录入口、评论计数或跳评论按钮；以后明确启用再设计用户自己的后端。 |
| 碎语 | Memos 外部数据，列表/详情及首页最近条目；[memos 页面](https://github.com/senshinya/blog/tree/6dac6683dbd0e9c9a921a7790086a44696d43910/app/pages/memos)。 | 不做页面/菜单/右栏 widget，不请求作者 Memos，不用静态假数据伪装同步。 |
| 娱乐收藏 | Bangumi 收藏与状态/类型分页；[media 页面](https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/pages/media/index.vue)。 | 不做页面/菜单，不复制作者 UID、收藏或代理。 |

## 后续修正顺序与待验证点

从请求涉及的模块切入；整站修正时优先设计 tokens/布局/字体和首页，再处理内容管线、阅读/全文搜索，随后归档、译文/Feed及游记。内容模型变动前先运行现有回归测试，阶段结束按 [acceptance.md](acceptance.md) 分别判断视觉与行为。

待验证：源站交互所有输入模式、视口/故障/键盘状态；当前本地在相同环境的截图差距；资源各自许可与用户正式域名/部署配置；用户真实译文和行程是否已提供。搜索的 `titles` 虽出现在存储字段和 boost 中，却未列入索引 fields，祖先标题检索/加权效果不能只据配置确认。仅调研不构成这些项目通过，也不授权新增库、连接服务或部署。
