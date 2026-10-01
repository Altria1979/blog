# 视觉与交互规格：当前博客对齐 Clarity

## 证据、范围与使用方式

- 固定参照为 `senshinya/blog` 的 `6dac6683dbd0e9c9a921a7790086a44696d43910`，研究日期为 2026-09-30。在线站可能继续变化；不在实现时静默改用 `main`。
- **源码确认**：下文给出的 CSS、组件或配置已在固定版本中核对。**在线观察**：研究时在线页面中实际可见的状态。**待验证**：没有匹配环境的运行证据，或仅检查了声明而没有检查浏览器行为。源码声明不等于所有浏览器均支持。
- 用户[首页截图](reference-home-desktop.png)为 2932×1522 像素；截图 viewport、DPR、缩放、字体加载状态未知，不能据此反推 CSS 像素尺寸，也不能充当 1440×900 的验收基线。中央“已添加到剪贴板”是系统浮层，底部链接状态条属于浏览器，均不复制到网页。
- 保留站名「Altria」、作者「Altria」、标语「生まれつきすごい人なんていない」、用户头像与现有内容。封面使用用户自己的插画素材；封面色彩不同可以是个人化，字体、比例、遮罩、间距不同仍属于实现差距。
- 评论、碎语、娱乐收藏暂缓。首页右侧为统计→技术信息，不用关于、分类、标签等新部件补满被移除的碎语位置；关于页保留。
- 以下保留源码的 `rem`/`em`。`1rem = 16px` 只适用于浏览器根字号为 16px 的测量环境；记录实际计算值后再比较，不能把所有相对单位直接硬编码为像素。行为验收见 [acceptance.md](acceptance.md)，内容适配见 [content-migration.md](content-migration.md)。

## 1. 字体、颜色、背景与图标

### 字体

**源码确认**：[字体变量][font]、[全局资源配置][nuxt]、[按语言／内容加载资源][resources]、[品牌字体][brand]。**在线观察**：参考首页加载了 InterVariable、抖音美好体和 AlimamaFangYuanTi。代码与日文页在目标浏览器中的最终字体命中、低 DPR 效果属于待验证。

| 用途 | 原站字体与加载规则 | 当前博客要求 |
| --- | --- | --- |
| 正文、导航、元信息 | `InterVariable`；中文回退含 Noto Sans SC 与系统无衬线。全局正文行高 `1.4`；源码没有当前博客的全局 `14px` 声明 | 检查 Network、`document.fonts` 和实际字符字体，不能只写一个未加载的 `Inter` 字体名 |
| 精选大标题、文章卡标题、部件标题 | `DOUYINSANSBOLD-GB`（抖音美好体），再回退 InterVariable | 保留字体用途分工，不能全部替换为普通系统粗体 |
| 品牌站名 | 本地 `AlimamaFangYuanTi.woff2`；可变轴 `wght` 与 `BEVL` | 用自己的站名，核实字体许可后再使用字体文件 |
| 代码 | JetBrains Mono；按正文中代码需要加载，系统回退包含 Cascadia Code、Consolas、Monaco | 代码字体与正文分离，不为所有页面无条件加载全部字体 |
| 故事类文章正文（`type: story`） | Noto Serif SC；本地 Noto Serif SC 的可变字体分支另有 CSS 支持条件 | 与技术文章的无衬线阅读样式区分，不把独立游记界面误套为故事文章 |
| 日文 | `:lang(ja)` 的正文、美术标题优先 Noto Sans JP，故事优先 Noto Serif JP；美术标题变量**移除**抖音美好体 | 不能只把 JP 字体放在抖音字体后面：后者覆盖假名及共用汉字，会提前命中字形 |
| 低 DPR | `max-resolution: 1.2dppx` 调整无衬线系统回退；日文分支仍保留 Noto Sans JP 优先 | 分别检查低 DPR 的中文与日文，不让条件分支恢复成中文字形 |

### 颜色与底纹

**源码确认**：[颜色变量][color]、[全局样式][main-css]、[卡片与文字工具样式][reusable]。主题色相为 `220deg`；以下 HSL 中的首项均为该色相。

| 语义 | 浅色 | 深色 |
| --- | --- | --- |
| 页面背景 | `hsl(220 20% 98%)` | `hsl(220 10% 10%)` |
| 卡片背景 | 白色 | `hsl(220 10% 18%)` |
| 部件背景 | `hsl(220 10% 95%)` | `hsl(220 10% 14%)` |
| 正文／次要／弱化文字 | 灰度 20%／40%／70% | 灰度 90%／70%／50% |
| 最强标题文字 | 黑色 | 白色 |
| 边界 | `hsl(220 10% 91%)` | `hsl(220 10% 20%)` |
| 主色 | `hsl(220 100% 55%)` | `hsl(220 100% 70%)` |
| 主色软背景 | `hsl(220 100% 60% / 15%)` | `hsl(220 100% 60% / 20%)` |
| 点阵颜色 | `hsl(220 20% 20% / 6%)` | `hsl(220 100% 95% / 7%)` |

- 底纹为 `24px × 24px` 网格，圆点位于 `(1px, 1px)`、半径参数 `1px`，`background-attachment: fixed`。不能用更重的点色或随文章滚动的贴图替代。
- 阴影按语义使用 `0 0.1em 0.2em`、`0 0.2em 0.5em`、`0 0.5em 1em`，颜色来自当前主题阴影变量；卡片悬停上移 `2px` 并增强阴影。减少动态效果时关闭非必要过渡。
- 圆角随组件定义，不用一个全局 `14px` 覆盖全部：文章卡 `0.8em`、普通卡 `0.5em`、部件 `0.8rem`、搜索 `1em`、阅读头图 `1rem`、偏好胶囊 `999px`。

### 图标

**源码确认**：[左侧导航][sidebar]、[文章卡][article-card]、[偏好配置][app-config]、[分类入口][filter]。以 Tabler 线性图标为主：搜索、文章、游记、归档、友链；日期用 `pencil-minus`，字数用 `pilcrow`，分类使用配置的图标与颜色。主题是 sun／device-desktop／moon。技术栈可使用对应品牌图标。

保留图标的语义、笔触与相对大小；可复用本地已有 SVG，不因对齐外观自动安装图标包。不要用“日历＋阅读时间”替代参考卡片的“书写日期＋分类＋字数”。

## 2. 页面骨架、侧栏与页脚

**源码确认**：[默认布局][layout]、[左侧栏][sidebar]、[右侧栏][aside]、[浮动开关][panel]、[页脚][footer]。**在线观察**：桌面首页三列，右侧统计、碎语、技术信息；本项目按用户范围移除碎语。

| 环境 | 结构与尺寸 |
| --- | --- |
| 宽度大于 1080px，存在右栏内容 | 左 `280px`／中 `minmax(0, 1fr)`／右 `280px`；列间距 `1rem`，根字号 16px 时总最大宽度 `1376px`；外层居中，无当前博客的全局 `24px` 内边距 |
| 宽度 769–1080px | 左宽 `clamp(240px, 25vw, 280px)`；右栏改为右侧抽屉，通过浮动按钮访问 |
| 宽度不超过 768px | 中间单列；左菜单与右栏分别为可开启抽屉，抽屉宽 `320px`、不超 viewport；首页正文顶部另有品牌入口 |
| 矮屏高度不超过 528px | 浮动侧栏按钮横排，抽屉底部留白按一排按钮调整 |
| 当前页面没有右栏插槽 | 桌面自然变为左＋正文两列，不留空右列 |

- 左右栏桌面 `sticky; top: 0; height: 100dvh`，各自可滚动。右栏的轨道只延伸至正文末端，页脚进入视口时可将其向上顶走；不是永远挡住页脚的 fixed 面板。
- 移动／平板右栏仍能访问目录或统计，不能通过 `display: none` 删除功能。抽屉有遮罩、激活状态和关闭操作；关闭与焦点恢复的目标行为见验收文档。
- 浮动菜单开关位于右下：横向边距 `min(1rem, 5%)`、底部 `min(2rem, 5%)`；半透明磨砂底、活动色，并避让悬浮分页。
- 左导航条目 `0.9em`，图标 `1.5em`，选中灰色软背景并带尾部圆点；搜索是轮廓入口，包含快捷键提示。它不是顶部横向导航的桌面缩小版。
- 语言／主题胶囊和社交图标位于左侧栏底部；版权位于主内容及右栏下方的页脚。页脚导航按探索／社交／信息分组，折行显示；内容使用自己的链接与版权配置。

### 品牌互动

**源码确认**：[品牌组件][brand]。头像为 `3em` 圆形，站名字号 `1.5em`，副标题 `0.75em`、半透明；品牌周围有响应高度的留白。字形可变轴动画和虚化 emoji 背景仅在 hover 时继续运行，静止时暂停。下一版复用结构与互动，用自己的标题与可配置装饰；不复制作者姓名、头像或个人 emoji 组合。触摸与减少动态效果的表现须另测。

## 3. 首页：精选、卡片、筛选与分页

### 精选轮播

**源码确认**：[轮播][slide]、[首页显示条件][index]。不是固定三格网格，也不只是带滚动条的静态横排。

- 有推荐文章、第一页且未选分类时显示；切换分类或进入后续页后隐藏。
- 起始对齐，循环，支持鼠标拖动、触摸拖动、横向滚轮和 Shift＋纵向滚轮；初始化不能使 SSR 第一行突然跳到居中位置。
- 卡宽 `max(12rem, 28%)`，上限 `80%`，宽高比 `1.77`，间隙 `min(1em, 2%)`。容器两端都有 `1.5rem` 淡出边缘。
- “精选文章”标题 `3rem`、行高 1，整个标题行有向下淡出的遮罩；标题行不是实心深色大标题。
- 静止时卡片底部展示单行省略标题和暗渐变；hover／focus 时显示完整居中标题与日期，背景由封面经 `brightness(0.8) saturate(3) contrast(0.8) blur(2em)` 得到。不要随机换纯色蒙层。
- 箭头位于轮播左右中央，滚动提示及箭头在 hover／focus-within 时出现。触摸端操作可发现性、循环所需内容数量与键盘体验待运行验证。

### 文章卡

**源码确认**：[卡片布局][article-card]、[卡片基础样式][reusable]。

| 项目 | 规格 |
| --- | --- |
| 卡片 | 外部竖向 margin `1em`，圆角 `0.8em`；内容 padding `1em`、内部 grid gap `0.5em` |
| 文字 | 美术标题 `1.2em`、描述 `0.9em`、元信息 `0.8em`；元信息可折行，不截掉末项 |
| 宽卡封面 | 右侧绝对定位，宽 `calc(40% + 2em)`、高为整卡；透明→50%处不透明的水平 mask；默认 opacity `0.8`，hover 为 1；文字区域宽 `60%` |
| 无封面 | 不保留图片空洞，文字使用正常宽度 |
| 窄卡封面 | viewport **或卡片容器**宽不超过 `528px` 时，封面移到顶部，全宽、宽高比 `2.4`、最大高 `256px`，`margin-bottom: -10%`、底部渐隐；文字恢复全宽，标题有主题卡片色阴影 |

528px 条件是 viewport 与 container 两条路径，不仅是手机断点。1024px 平板上的中间列可能很窄，也应命中顶部图片布局。

### 分类菜单与分页

**源码确认**：[分类入口][filter]、[首页导航状态][index]、[分页组件][pagination]、[每页数量][app-config]。

- 列表上方右侧为文件夹图标＋“全部分类”的下拉入口；选中后关闭、回第一页，并更新 URL。不是一排分类标签与计数按钮。
- 每页 **10 篇**。分页是一个统一的边框、阴影、卡片背景胶囊，选中页为蓝色软背景；前后箭头到边界禁用，长页数使用省略号。
- 分页 `sticky` 在 `bottom: min(2em, 5%)`。列表末尾锚点进入视口后展开，未进入时收窄；不是永远在列表最下方的普通按钮行，也不是全局 fixed。
- 移动端分页与侧栏开关需要避让。切页、筛选、后退应恢复正确状态；具体 route 兼容规则见内容迁移文档。

### 首页右栏

**源码确认**：[统计][stats]、[技术信息][tech]、[部件外观][widget]。本项目采用统计→技术信息，二者之间正常 `1rem` gap，不为暂缓碎语保留空框。

- 统计有三列，每列上标签、下值，长值可折行：运营时长／上次更新／总字数。建立时间取用户配置，“上次更新”取实际构建时间，总字数不因三种译文重复计数。
- 部件字号 `0.9em`，标题为美术字体、次要色；卡片 padding `0.5rem 0.8rem`、圆角 `0.8rem`、使用部件背景色。
- 技术信息列出真实平台、图片存储、代码与文章许可、规范域名，支持展开实际 Next.js／React／Node 等构建信息。原站写死的 R2、Vue、Nuxt、作者域名不能直接移植；未配置的服务不得伪造。

## 4. 语言与主题胶囊

**源码确认**：[外层胶囊][preferences]、[语言切换][lang]、[主题切换][theme]、[选项配置][app-config]。

- 语言与亮／系统／暗三种主题在同一个胶囊；默认宽 `13rem`，语言展开后宽 `17.25rem`，含边框、内侧高光、软阴影与活动选项滑动底板。
- 语言入口展开为 中／En／あ，当前选项高亮；外部点击、焦点离开、Escape 关闭，键盘关闭后恢复入口焦点。没有真实译文的文章语言选项保留可解释的 `aria-disabled` 状态，禁止导航到伪译文。
- 精细指针选项高 `2.125rem`，粗指针为 `2.75rem`。减少动态效果时关闭宽度与位移动画。
- 主题选项活动底板在客户端确认偏好后显示，避免 SSR／hydration 选中状态冲突；系统选项跟随系统明暗变化。记录浅色、深色、system 首次载入与持久化后的截图，不能仅验一次点击。
- 当前路径决定语言。语言建议与保存偏好不能抢先自动重定向或让可用译文判断失效；三语界面字体与文本长度分别验收。

## 5. 文章阅读页

### 头图、正文与目录

**源码确认**：[文章头部][post-header]、[阅读排版][article-css]、[侧栏目录][toc]、[进度条][progress]、[目录位置与滚动][toc-scroll]。

- 头部为“封面＋上方元信息＋下方标题”的叠层，存在封面时高度范围 `16rem–20rem`，标题 `1.6em`、行高 1.2、底部黑渐变；有可选封面滤镜。桌面 margin `0.5rem`、圆角 `1rem`；手机 margin 0、圆角 0。无封面仍使用同一标题与元信息结构。
- 分享操作在 hover／focus-within 时出现；复制站名、文章标题、可选摘要与用户站点的正式 URL。原站硬编码的作者链接须改为用户配置。
- 正文直接置于页面背景，外 margin `1rem`、行高 `1.8`，不套整篇白色圆角卡片。技术标题使用美术字体、主色标记；故事正文用衬线字体、居中标题、段落缩进等独立规则。
- 正文链接目标有暂时高亮；标题间距、引用、列表、表格、行内代码由内容组件共同决定。不能只把原站 h1 大小移植而保留本地整篇卡片排版。
- 阅读页右栏替换为分层 TOC，显示当前标题蓝色竖轨，父层也保持活动层级；目录内容内部滚动，跟随正文活动标题。提供回顶部入口；因评论暂缓，移除跳评论入口。
- ≤1080px 目录通过右抽屉访问；不能藏进正文原生 `details` 来替代侧栏结构。空目录有明确状态，不渲染假的条目。
- 顶部进度条为 `2px`，作用区间是正文 `.article` 的视图时间线，不把头图、页脚或评论当分母。固定源码在不支持 CSS scroll timeline 时不显示进度；Next.js 若增加 JS 降级，须记录为有意扩展并保持正文区间。

### 代码、图片与阅读底部

**源码确认**：[代码块][pre]、[代码参数][app-config]、[Markdown 图片][prose-img]、[图文组件][pic]、[图片尺寸][img]、[灯箱][lightbox]、[文章底部][post-footer]。

- 代码块字号 `0.85em`、行高 1.4、圆角 `0.5em`。文件名置于顶部标签，语言位于顶部右侧；复制／折行操作在 hover／focus-within 时出现。支持行号、缩进线、差异与高亮，主题高亮配色需结合实际资源再次核对。
- 高亮靠近视口时启动，加载失败保留转义后的纯文本，不产生空白代码块。超过 **32 行**默认折叠为 **16 行**；可显式展开。折叠有渐隐遮罩，底部按钮带行数、字符数、字节数，32／33 行和末尾换行边界须测试。
- 正文图保持固有尺寸，补齐 width／height、LQIP 与响应尺寸以避免布局跳动；Markdown 图片最大高 `60vh`、圆角 `0.5em`、点击指针为 zoom-in。普通 Markdown `<p>` 中的图片不插入导致段落自动闭合的块级包装。
- 文章灯箱是单目标放大、说明和关闭按钮；底部说明栏为磨砂胶囊。当前 wrapper 没有上一张／下一张图库能力，不把游记图库的行为误记到文章灯箱。
- 阅读底部记录引用／许可／作者声明及相邻或显式系列导航。作者印章、具体底部间距与全部特殊内容组件的运行外观待匹配内容样本后验证，不凭首页截图推断。

## 6. 搜索弹层

**源码确认**：[弹层][search]、[结果项][search-item]、[搜索状态与索引查询][search-store]。搜索能力须同步执行功能矩阵，外观不能掩盖仅搜元信息的实现。

- 搜索弹层 fixed，自顶部 `10dvh` 开始，宽 `90%`、最大 `768px`，圆角 `1em`，蓝色边框及主色软轮廓，半透明背景与 `blur(1rem) saturate(1.5)` 磨砂效果。
- 输入行与结果分区；结果容器最大高 `calc(80dvh - 6rem)`、内部可滚动。结果项带活动背景，文章标题→章节路径、正文摘录与命中高亮；摘录字号 `0.8em`。
- 查询按文章正文分节索引，标题加权、前缀与模糊匹配、当前语言分词和 100ms 防抖属于功能验收。源码的索引字段为 `title`／`content`；`titles` 只列在存储字段与 boost 配置中，祖先标题加权是否生效须单独验证。章节面包屑展示不能当作它参与了检索的证据。排除 `pre` 代码正文，不能以标题／描述／标签 `includes()` 冒充全文搜索。
- Cmd／Ctrl＋K 打开，支持上下键选择、Enter 到章节锚点、Escape 关闭与焦点恢复；选中文本可作为初始搜索词。触摸屏软键盘遮挡、IME 输入、结果高亮可读性与减少动态效果需要运行验证。

## 7. 归档、友链与游记

### 归档

**源码确认**：[归档页][archive]、[条目][archive-item]、[悬停预览][archive-preview]。按年分组，年份为淡出遮罩＋细描边的大数字，年度字数／篇数并列；标题 sticky，列表支持分类和密度／列数调节。源码年份旁的年龄是作者个人配置，用户未设置生日时不显示年龄。

细指针 hover 预览为 `220px × 138px` 封面，柔和阴影、缩放／透明度过渡；粗指针、无 hover、减少动态效果时隐藏。布局不依赖预览才能访问文章。年度标题重叠、调节面板与浮动按钮避让需在足够多的用户内容下运行验证。

### 友链（历史参考，当前已移除）

本节仅保留参考站的研究记录。按 2026-10-01 用户要求，友链不属于本地实现或视觉验收范围，不因还原参考站重新引入页面、入口或相关功能。

**源码确认**：[页面][friends]、[分组][feed-group]、[卡片][feed-card]。分组标题为美术字体描边大字、带下渐隐；分组可洗牌，卡片含头像、作者、站点简称，hover 详情显示站点介绍、域名与技术图标。组网格使用 `auto-fill`，宽卡最低列宽 `12em`；viewport 或容器 ≤528px 时改为最低 `5em`、纵向头像文字布局。

参考站“我的信息／申请”使用选项卡；自己的站点信息可逐项复制，申请说明由 Markdown 内容提供。触摸用户如何查看详情、洗牌的首帧与 SSR 稳定性是源站尚未运行验证的研究项，不进入当前本地验收。

### 游记

**源码确认**：[列表页][travels]、[全屏详情][travel-detail]、[地图][travel-map]、[照片卡][travel-photo]。**在线观察**：原站有独立游记列表和实际多日照片内容；原作者行程不作为用户种子内容。

- 列表延续文章卡的封面渐变语法，宽卡右侧方形来源封面与文字区；viewport／容器 ≤528px 时顶部封面宽高比 `2.4`、负下边距与底部渐隐。
- 详情为独立 `100dvh` 叙事界面，不使用普通博客三列外壳。桌面正文／地图比例 `55fr : 45fr`；章节逐屏纵向 snap、照片网格及地图当前章节／照片同步。地图保持可见，照片查看器覆盖文字列。
- ≤768px 地图位于顶部，高 `35dvh`，可收起到 `2.5rem`；正文变为自然内容高度。照片网格最低宽由 `13rem` 改为 `7.5rem`，照片卡比例 `4 / 3`，无 hover 时说明保持可见。
- 游记有独立照片上一张／下一张工具条，和文章单图灯箱不同。地图显示当前照片标记、弹出照片与说明；失败时保留占位说明与可阅读正文、照片。
- 原站地图栈的运行细节、外部瓦片条款、WebGL 失败和滚轮／键盘／触摸的章内外切换，需要在用户自己的行程数据下核验。不能把地图出现过等同于所有失败降级已通过。

## 8. 当前博客的已知差距与复核入口

下面是研究时本地快照，不是永远成立的任务列表；修改前重读这些组件及对应 CSS，更新 [feature-map.md](feature-map.md) 的状态。

| 当前实现 | 需要修正的方向 |
| --- | --- |
| `app/globals.css`：260px 侧栏、32px gap、外层 24px padding、sticky top 24px；1180px 隐藏右栏 | 使用本规格布局及 1080px／768px 抽屉结构，保留移动目录入口 |
| 全局 14px、仅声明 Inter、没有原站字体资源分工 | 实际加载许可明确的字体，恢复标题／品牌／故事／代码／日文分工 |
| `public/images` 与 README 标明的 Unsplash 示例照片 | 现有素材如实标注来源；插画式封面是后续方向，不能把已有照片记为用户原创插画 |
| `app/page.tsx` 与 `components/article-feed.tsx`：静态精选、分类标签、每页 5 篇、普通底部按钮 | 条件显示的循环精选、分类下拉、每页 10 篇、收窄／展开的 sticky 分页 |
| 移动文章卡仍为右侧图片，缺少容器查询 | 528px viewport 与 container 双路径的顶部图片布局 |
| `components/info-sidebar.tsx`：文章数、分类数、关于、标签等 | 统计→真实技术信息；暂缓模块不以新部件替代 |
| `components/search-dialog.tsx`：仅元信息包含匹配 | 正文分节索引、标题路径／摘录／高亮、键盘选择与章节定位 |
| `app/posts/[slug]/page.tsx`：独立标题＋图片＋整篇白卡、正文 details 目录 | 头图叠层、页面背景正文、侧栏目录、阅读增强组件与正文进度 |
| 只有中文，未实现游记独立界面 | 实际译文关联与日文字体；独立游记体验，不生成作者内容或伪译文 |

## 9. 未完成验证与资源许可

- 待验证集中在：匹配 viewport／DPR 的在线基线、字体字符命中与许可、日文低 DPR、触摸／键盘互动、减少动态效果、浏览器不支持 mask／backdrop／scroll timeline 的降级，以及内容组件全量样本。看到源码或截图不能将这些标记为已验收。
- 原仓库[软件许可证][license]为 MIT，但软件许可不自动覆盖字体、文章、头像、封面或旅行照片。代码复用保留版权与许可声明；字体文件逐一确认来源与分发条件；参考图只作对照，用户自己的发布资源另行记录。
- 不移植原作者姓名、生日、UID、服务域名、评论／碎语／Bangumi 配置或分析脚本标识。技术信息的文章许可、部署与图片存储以用户配置和真实运行环境为准。
- 视觉完成要求是匹配环境下逐项证据与差异说明；构建通过、一个“相似度”分数或旧截图不能代替本规范的复核。

[font]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/assets/css/font.css
[nuxt]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/nuxt.config.ts
[resources]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/utils/contentResources.ts
[color]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/assets/css/color.css
[main-css]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/assets/css/main.css
[reusable]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/assets/css/reusable.css
[layout]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/layouts/default.vue
[brand]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/blog/BlogHeader.global.vue
[sidebar]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/blog/BlogSidebar.vue
[aside]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/blog/BlogAside.vue
[panel]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/blog/BlogPanel.vue
[footer]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/blog/BlogFooter.vue
[slide]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/post/Slide.vue
[article-card]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/post/Article.vue
[index]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/pages/index.vue
[filter]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/post/Filter.vue
[pagination]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/partial/Pagination.vue
[app-config]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/app.config.ts
[stats]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/widget/BlogStats.vue
[tech]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/widget/BlogTech.vue
[widget]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/blog/BlogWidget.vue
[preferences]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/blog/ReadingPreferences.vue
[lang]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/blog/LangToggle.vue
[theme]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/blog/ThemeToggle.vue
[post-header]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/post/PostHeader.vue
[article-css]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/assets/css/article.css
[toc]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/widget/Toc.vue
[toc-scroll]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/composables/useToc.ts
[progress]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/post/Progress.vue
[pre]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/content/ProsePre.vue
[prose-img]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/content/ProseImg.vue
[pic]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/content/Pic.vue
[img]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/util/Img.vue
[lightbox]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/popover/Lightbox.vue
[post-footer]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/post/PostFooter.vue
[search]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/popover/Search.vue
[search-item]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/popover/SearchItem.vue
[search-store]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/stores/search.ts
[archive]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/pages/archive.vue
[archive-item]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/post/Archive.vue
[archive-preview]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/post/ArchivePreview.vue
[friends]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/pages/friends.vue
[feed-group]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/content/FeedGroup.vue
[feed-card]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/content/FeedCard.vue
[travels]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/pages/travels/index.vue
[travel-detail]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/pages/travels/%5Bslug%5D.vue
[travel-map]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/travel/Map.vue
[travel-photo]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/app/components/travel/PhotoCard.vue
[license]: https://github.com/senshinya/blog/blob/6dac6683dbd0e9c9a921a7790086a44696d43910/LICENSE
