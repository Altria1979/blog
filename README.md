# Altria Blog

> 万事万物皆有数，希望你心里也有。

Altria 的个人博客，用来记录前端开发、技术实践、年度总结，以及生活和旅行中的见闻，也作为学习和实践 Next.js 的个人项目。

博客的布局、阅读体验与交互主要参考声哥的开源项目 [senshinya/blog](https://github.com/senshinya/blog)（[信也のブログ](https://blog.shinya.click/)），结合自己的内容，使用 Next.js 和 React 实现。

访问地址：[altria.ink](https://altria.ink) · 源码：[Altria1979/blog](https://github.com/Altria1979/blog)

## 当前功能

- 文章列表、分类与标签筛选、标题与摘要等元信息搜索、按年归档和关于页。
- Markdown 富内容文章，支持代码高亮、公式、图表、乐谱和图片灯箱。
- 中文、英文、日文界面与独立文章译文，浅色、深色和跟随系统主题。
- 分语言 RSS、站点地图及文章 SEO。
- 全站累计浏览量（PV）、访客数（UV）和国家访问排行，由 Supabase 存储与统计。

## 技术栈

| 方向 | 当前实现 |
| --- | --- |
| 框架 | Next.js 16.3.7（App Router）+ React 19.3.0 |
| 语言与样式 | TypeScript 5.9 + 原生 CSS / CSS Modules |
| 内容管理 | 本地 Markdown 文件 + YAML 元数据，使用 unified / remark / MDC 解析 |
| 富内容 | Shiki 代码高亮、KaTeX 公式、Mermaid 图表、abcjs 乐谱 |
| 图片存储 | 阿里云 OSS，仓库保存图片尺寸与校验清单 |
| 访问统计 | Supabase / PostgreSQL，通过服务端 RPC 记录与聚合 |
| 部署与域名 | Vercel 构建与 HTTPS，Cloudflare 仅托管 DNS |
| 工程工具 | npm、ESLint、TypeScript 类型检查、Node.js 测试运行器 |

文章随代码维护，文章页在构建时生成；文章内容无需数据库或 CMS，访问统计使用 Supabase 数据库。依赖版本由 `package-lock.json` 锁定。

## 本地运行

需要 Node.js 20.9 或更新版本，以及 npm。

```sh
npm ci
cp .env.example .env.local
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。站名、作者、介绍和社交链接在 [`blog.config.ts`](blog.config.ts) 中配置。

## 部署方式

当前使用 Next.js 默认生产构建，可部署到 Vercel 或自行运行 Node.js 服务。

本站使用 Vercel 项目 `altria1979-blog`，关联本仓库的 `main` 分支；推送后自动构建并部署。生产环境的 `NEXT_PUBLIC_SITE_URL` 设置为 `https://altria.ink`。

域名在阿里云注册，由 Cloudflare 免费计划托管 DNS。根域和 `www` 使用 Vercel 为本项目分配的 CNAME，设为「仅 DNS」，由 Vercel 提供 HTTPS；`www.altria.ink` 和原 Vercel 地址会跳转到主域名 `altria.ink`。

### Vercel

1. 将 Git 仓库导入 Vercel，框架选择 **Next.js**。
2. 安装命令使用 `npm ci`，构建命令使用 `npm run build`。
3. 在项目环境变量中设置 `NEXT_PUBLIC_SITE_URL=https://你的域名`，然后部署。

连接 Git 仓库后，后续推送代码或文章会触发重新构建。

### Node.js 服务器

在服务器准备 Node.js 环境，将仓库放到服务器，并在构建前配置 `.env.local` 中的 `NEXT_PUBLIC_SITE_URL`：

```sh
npm ci
npm run build
npm start
```

当前 `npm start` 监听 `127.0.0.1:3000`，通过 Nginx 等反向代理对外提供 HTTPS，并使用进程管理工具保持服务运行。更新文章或配置后需要重新构建并重启服务。

### 环境变量

| 变量 | 说明 |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | 站点完整地址；本地默认为 `http://localhost:3000`，生产环境应填写正式域名，用于 canonical、RSS 和 sitemap。 |
| `NEXT_PUBLIC_IMAGE_BASE_URL` | 可选，默认使用项目现有的阿里云 OSS 地址；更换图床时设置为 HTTPS origin。 |
| `SUPABASE_URL` | 服务端使用的 Supabase 项目 HTTPS 地址，仅配置在 Vercel Production 环境。 |
| `SUPABASE_SECRET_KEY` | 服务端专用的 `sb_secret_...` 密钥；绝不能使用 `NEXT_PUBLIC_` 前缀或提交到 Git。 |
| `SUPABASE_SERVICE_ROLE_KEY` | 可选的旧版 `service_role` JWT，仅在没有新 secret key 时使用；同样只放服务端。 |

环境变量示例见 [`.env.example`](.env.example)，修改后需重新构建。图片由浏览器直接从 OSS 加载；自行部署可以沿用现有图片，也可以配置自己的图床。

## 访问统计

侧栏的「访问统计」存储在 Supabase 的 `public.blog_traffic_visitors` 表中，每个匿名访客一行；累计浏览量是 `page_views` 总和，累计访客是行数。仅 Vercel 生产构建（`VERCEL_ENV=production`）在 `https://altria.ink` 上启用采集；本地、预览部署及其他域名显示 `—`，不发送统计请求。

全站首次加载、刷新和页面路径切换各上报一次；筛选参数、目录锚点、主题及侧栏开关不增加计数。统计请求本身会增加 PV，因此不轮询、不自动重试。文章页虽然显示目录，仍会计入全站访问。

浏览器通过本站 `POST /api/traffic` 获取标准 JSON，服务端调用 `record_blog_page_view` 数据库函数，在同一事务中以原子 upsert 增加次数并写入访问明细，避免并发覆盖计数。表启用 RLS，表、视图与函数仅授予 `service_role` 必要权限（[RLS 无公开策略的 INFO 提示](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy)在此服务端专用设计中是预期行为）；浏览器不能直接读写表，也不会收到数据库密钥。请求不缓存、不执行远程脚本，不记录 User-Agent 或访问路径。

访客使用服务器生成的随机 UUID，以 `altria_visitor_id` Cookie 保存一年并随访问续期，设置 `Secure`、`HttpOnly`、`SameSite=Lax`。页面跳转按顺序上报，保证首次身份设置后再处理下一次访问；失败响应也保留身份，以覆盖数据库已提交、响应却丢失的情况。清除 Cookie、换浏览器、Cookie 过期或首次多标签并发可能计为新访客，UV 不等于精确自然人数。

首次接入时，在目标 Supabase 项目按顺序执行 [`blog_traffic` 迁移](supabase/migrations/20261002063828_blog_traffic.sql)、[`blog_traffic_geography` 迁移](supabase/migrations/20261002065835_blog_traffic_geography.sql)及 [`blog_traffic_country_top3` 迁移](supabase/migrations/20261002071102_blog_traffic_country_top3.sql)，将服务端环境变量加入 Vercel Production，再部署代码。已有项目先应用新增迁移，再发布代码；新增 RPC 参数带默认值，兼容升级过程中的旧部署。可在隔离数据库执行 [累计值检查](supabase/tests/traffic.sql)、[国家统计检查](supabase/tests/traffic-geography.sql)及 [Top 3 检查](supabase/tests/traffic-country-top3.sql)验证事务、去重及权限；检查会回滚全部测试访问，不应在有并发真实访问的生产库运行。不要把密钥放进浏览器代码或公开表策略。

`public.blog_traffic_page_views` 从国家统计接入后开始逐次记录 `visitor_id`、`ip_address`（IPv4/IPv6）、`country_code`、`visited_at`。IP 和国家仅从 [Vercel 平台请求头](https://vercel.com/docs/headers/request-headers) `x-vercel-forwarded-for`、`x-vercel-ip-country` 获取，校验失败或缺失存 NULL，不使用浏览器正文或其他代理头补值。当前 Cloudflare 必须保持 DNS-only；增加反向代理后要重新检查来源。VPN/代理可能使国家成为出口所在地，国家不代表国籍或真实居住地。IP 不参与 UV 去重，也不会出现在网页响应或应用诊断日志中。明细目前持续保留、未设置自动清理；数据量增长后需要评估存储和保留期限。

「访问统计」卡片在累计 PV/UV 下方显示国家访问 Top 3，按各国 PV 降序、同分按国家代码升序排列；未知国家不参与排行，不足三国只显示已有记录。国家名称随中、英、日语言切换。国家数据来自同一次计数 RPC，不增加额外请求或 PV；只返回 `countryCode` 和 `pageViews`，没有 IP 或访客 ID。排行缺失或格式异常时显示 `—`，总计仍可正常显示；空排行显示「暂无国家数据」。

在 Supabase 的 SQL Editor 可查询完整国家排行及各国 UV：

```sql
select country_code, page_views, visitors
from public.blog_traffic_country_rankings
order by page_views desc, visitors desc, country_code;
```

`page_views` 为各国 PV，`visitors` 为各国内按匿名访客 ID 去重的 UV；同一浏览器从不同国家访问会分别计入各国 UV，所以各国 UV 之和可能超过全站 UV。`ZZ` 表示未知，排行只使用新增明细，不补猜接入前的国家。排行视图使用 `security_invoker` 且不含 IP 或访客 ID，匿名及普通登录角色没有读取权限；完整视图仅在 Supabase 后台或受信任服务端查看，网页通过本站接口获得精简后的 Top 3 聚合数据。可对明细的 `visited_at` 加时间范围筛选，再按 `country_code` 分组生成日榜或月榜。新建的访客外键索引在尚无查询命中时可能出现 [unused_index INFO](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index)，保留它用于按访客查询及外键检查。

计数持久保存在数据库，网站重启或重新部署不会重置；更换数据库或删除统计表会影响历史数据。不蒜子的历史数字和未采集访问不会补入新表。加载或存储不可用时显示 `—`，实际零值显示为 `0`。当前每次访问会聚合访客表，适合个人博客；访客量显著增长时可单独评估汇总表。更换正式域名时需同步修改采集器与接口的域名限制。

## 内容维护

- 中文文章放在 `content/posts/`，英文和日文译文分别放在 `content/posts/en/`、`content/posts/ja/`。
- 文件名对应文章地址，例如 `hello-world.md` 对应 `/posts/hello-world`；`draft: true` 的文章不会发布。
- 写作语法与组件用法见 [Markdown 与富内容指南](docs/markdown-examples.md)。
- 图片上传、清单生成和存储配置见 [图片存储与管理](docs/image-storage.md)。

常用检查命令：

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

## 参考与致谢

感谢声哥开源的 [senshinya/blog](https://github.com/senshinya/blog)，这是本站主要的设计与交互参考；同时参考了 [纸鹿摸鱼处](https://blog.zhilu.site/) 的 Clarity 博客实现。

上游代码来源、固定参考版本与许可声明见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)；字体说明见 [public/fonts/README.md](public/fonts/README.md)。文章、图片和字体的授权分别保留各自的说明。

## 软件许可

本站软件代码采用 [MIT License](LICENSE)。文章、图片和字体的授权分别保留各自的说明；第三方代码及依赖许可见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
