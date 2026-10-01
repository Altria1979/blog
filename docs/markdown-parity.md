# Markdown 文章能力对齐记录

本次对照两个项目的文章源码、内容组件、解析插件和前置信息结构，将缺失的写作格式迁移到当前 Next.js / React 博客。现有文章路径和三语对应关系继续使用本地文件名。

## 对照依据

- [senshinya/blog，6dac668](https://github.com/senshinya/blog/tree/6dac6683dbd0e9c9a921a7790086a44696d43910)：`app/components/content/`、`remark/`、`content.config.ts`、`nuxt.config.ts` 与文章源文件。
- [L33Z22L11/blog-v3，381f1c1](https://github.com/L33Z22L11/blog-v3/tree/381f1c1648a53d6f7aa8e351d521311af6da998d)：`app/components/content/`、`shared/utils/icon.ts`、`app/assets/css/`、内容 schema 与文章源文件。
- [纸鹿组件样式示例源码](https://github.com/L33Z22L11/blog-v3/blob/381f1c1648a53d6f7aa8e351d521311af6da998d/content/previews/example.md)和[在线示例](https://blog.zhilu.site/previews/example)：源码确定语法，在线页面辅助核对组件结构。

上游软件许可与本次依赖声明见 [THIRD_PARTY_NOTICES](../THIRD_PARTY_NOTICES.md)。未复制上游作者的正文、图片或账号资料到文章目录。

## 本次补齐的差距

| 范围 | 原先缺口 | 已接入的格式与行为 |
| --- | --- | --- |
| 前置信息 | 简单字符串解析，缺少嵌套字段 | YAML 数组、多行文本和对象；`published/updated`、层级 `categories`、`image`、推荐权重、SEO、参考链接、许可、创作声明、侧栏顺序；兼容原 `date/category/cover/tags/featured` |
| 阅读头部 | 上游部分显示字段未消费 | `hideInfo`、`coverDim`、`coverFilter`，支持顶层及 `meta` 对象，显式滤镜优先；只影响头图，不改变灯箱原图 |
| Markdown 基础 | GFM、脚注等覆盖不足 | 删除线、任务列表、自动链接、引用式链接、重复脚注回链、硬换行、Setext 标题、嵌套列表；保留现有标题 ID 与目录关联 |
| MDC | `::`、属性、插槽被当作普通文本 | 行内 `:组件`、块级 `::组件`、嵌套容器、YAML 属性、JSON 数据绑定、`#title/#default/#tab1` 等具名插槽、安全原生属性 |
| 提示和组织 | 缺少内容组件 | Alert、Folding、Tab、CardList、Quote、MdTitle、Poetry、Chat、Timeline；标题和默认插槽均保留，目录能展开隐藏内容 |
| 行内交互 | 缺少标记和交互 | Badge、Blur、Tip、Key、EmojiClock、Icon；复制文字、键盘揭示、快捷键按压状态、时钟及外链图标 |
| 代码 | 支持语言少、缺少上游 meta 与注释标记 | Shiki 按需加载语言，Catppuccin Latte / One Dark Pro 双主题；文件名/语言图标、行号、行与词高亮、diff/focus/error/warning 标记、缩进导线、wrap/expand、原文复制；保留 33 行触发、折为 16 行规则 |
| 可编辑命令 | 缺少 Copy 组件 | 提示符语言推断或显式 `lang`，输入实时高亮、复制编辑值、恢复初始值、主题切换与横滚同步 |
| 表格 | 缺少阅读操作 | 横滚、换行切换、表头固定，窄屏不撑开页面 |
| 图片与卡片 | 富题注、卡片数据和样式不足 | Pic/Markdown 图片尺寸、原生 `alt/title`、富题注、灯箱；LinkCard、LinkBanner、FeedCard、FeedGroup；作者提供的数据和安全样式、渐变边框、随机/恢复顺序 |
| 数学公式 | 没有真实公式渲染 | KaTeX 行内 `$...$`、块级 `$$...$$`，本地字体/CSS、MathML、长公式局部横滚 |
| 图表 | Mermaid 源码直接显示 | 真正的 Mermaid SVG、深浅主题重绘、适宽与原尺寸切换、错误时保留源码 |
| 乐谱 | ABC 源码直接显示 | ABC 乐谱排版、点击播放、播放控件；音色网络失败时保留可读乐谱及原文 |
| 嵌入内容 | 缺少媒体组件 | VideoEmbed 的受控视频来源和尺寸/比例；GitHub 公共仓库卡片、缓存、超时和回退链接 |
| 文章插槽 | 元信息混入正文 | `meta-aside-*` 按 `aside` 排序进入桌面侧栏或移动目录，`meta-copyright` 替换文末许可说明，不进入正文或字数 |
| 文字样式 | MDC 类名没有对应样式 | `text-center/text-story/text-tech/text-creative/text-repeat/text-zoom/title-like`，渐变卡片 active 状态，减少动态效果偏好 |

用法集中在 [Markdown 与富内容示例](markdown-examples.md)。示例是文档，不进入首页、RSS 或 sitemap。

## 实现与复用

- `lib/markdown.ts` 统一 AST、目录和纯文本提取。复用既有 React 转义渲染，不把文章当作 JSX 或 Vue 程序执行。
- `lib/frontmatter.ts` 和 `lib/posts.ts` 处理结构化元数据，继续保留旧文章的发布、日期、封面和语言规则。字数与自动摘要使用可读正文，排除代码与元信息插槽。
- `components/markdown.tsx` 复用现有图片清单、图片排列、灯箱、代码工具栏，增加富内容分派。客户端交互分在 `markdown-interactions`、`markdown-media`、`markdown-feed-card`；解析和公式仍在服务端。
- `lib/code.ts`、`lib/code-highlight.ts`、`lib/content-media.ts`、`lib/content-icons.ts` 负责受控语法、媒体 URL 和上游图标映射。
- `app/_pages/post.tsx`、`home.tsx`、`components/site-layout.tsx`、`reading-navigation.tsx`、`article-feed.tsx`、`lib/rss.ts` 消费元数据，避免只解析不展示。
- 新增正文/媒体/代码样式；`article-image.tsx` 区分图片替代文字、悬停说明、可见题注和灯箱说明，保留已有封面预览能力。
- 更新 README、三语建站文章和许可说明；`scripts/test.mjs` 改用 ESM 加载同一解析链，不新增测试运行器。

## 验证证据

验证脚本、结果和截图保存在 `.omx/evidence/markdown-parity/`，视觉判定保存在 `.omx/state/markdown-parity/ralph-progress.json`。

- 初始 56 个回归测试通过；现已通过 97 个测试，完成后的结果见 `tests.log`，覆盖 YAML、MDC、嵌套引用/脚注、字数摘要、危险 URL、代码标记、媒体地址和图片分组。
- 固定版本共 131 篇文章，7,886 个正文片段、1,901 个代码值、34 个非空图片 alt 全部保留，0 解析异常；详细统计和排除规则见 `upstream-corpus-audit.json`。此检查证明解析覆盖，不等于逐篇媒体服务可用。
- `browser-checks.json`：生产模式实际点击，覆盖任务列表、脚注、KaTeX、折叠、Tab 键盘操作、隐藏章节的目录导航、编辑复制/恢复、图片灯箱、属性与题注、元信息插槽；1440 桌面，1024/768/390/320 宽度以及手机目录、提示框边界。
- `feed-browser.json`：订阅卡片 hover/focus/触屏详情、日期与技术栈、Esc、320/390px 浮层边界、随机/恢复排序。
- `media-final-browser.json`、`copy-browser.json`、`copy-fallback-browser.json`：真实 Mermaid SVG、ABC 乐谱、GitHub 公共 API、编辑高亮，网络/脚本加载失败回退。乐谱未在自动验收中发声。
- `desktop-components.png`、`desktop-dark.png`、`mobile-dark.png`、`mobile-toc.png`：正文层级、深浅主题和响应式截图。保留 Altria 品牌与内容，没有整页逐像素一致性声明。
- `lint.log`、`build.log`、`typecheck.log` 记录最终静态检查和正式构建，均通过。`production-checks.json` 记录首页/归档/关于/三语文章/RSS/sitemap 的 200 响应、未知页面/临时样例/已移除友链页的 404 响应及 0 JavaScript 页面异常；汇总见 `verification.json`。临时验收文章在完成交互测试后移出文章目录，正式构建再次检查旧路由与不存在路由。

## 保留的边界与限制

- 任意 JavaScript/Vue 表达式、脚本标签、事件属性、危险 URL 不执行。绑定属性只接受 JSON 数据；未识别的组件保留可读内容。CSS 限于排版相关属性与安全内建滤镜。
- `permalink` 不替换既有 `/posts/...` 地址，原作者的 Nuxt 路由和镜像服务配置不带入本地。图片继续使用本站的存储与图片清单。原有普通图片题注保留，显式 Pic 题注不重复。
- GitHub 卡片在进入视口后访问公共 API；它与上游服务端预取的实现方式不同。GitHub 限流、视频平台禁止嵌入、字体/图标/音色服务不可用时提供回退；不能保证第三方服务永久可用。
- FeedCard/FeedGroup 仅呈现文章里显式填写的数据，不恢复已移除的友链页面，不接入原作者服务。评论、碎语、娱乐收藏和整站其他模块未扩大范围。
