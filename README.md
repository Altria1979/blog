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
- 全站累计浏览量（PV）和访客数（UV），由原版不蒜子提供计数。

## 技术栈

| 方向 | 当前实现 |
| --- | --- |
| 框架 | Next.js 16.3.7（App Router）+ React 19.3.0 |
| 语言与样式 | TypeScript 5.9 + 原生 CSS / CSS Modules |
| 内容管理 | 本地 Markdown 文件 + YAML 元数据，使用 unified / remark / MDC 解析 |
| 富内容 | Shiki 代码高亮、KaTeX 公式、Mermaid 图表、abcjs 乐谱 |
| 图片存储 | 阿里云 OSS，仓库保存图片尺寸与校验清单 |
| 工程工具 | npm、ESLint、TypeScript 类型检查、Node.js 测试运行器 |

文章随代码维护，文章页在构建时生成，无需数据库或 CMS。依赖版本由 `package-lock.json` 锁定。

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

环境变量示例见 [`.env.example`](.env.example)，修改后需重新构建。图片由浏览器直接从 OSS 加载；自行部署可以沿用现有图片，也可以配置自己的图床。

## 访问统计

侧栏的「访问统计」使用[原版不蒜子](https://busuanzi.ibruce.info/)，不需要数据库、账号或 API 密钥。仅 Vercel 生产构建（`VERCEL_ENV=production`）在 `https://altria.ink` 上启用采集；本地、预览部署及其他域名显示 `—`，不发送统计请求。

全站首次加载、刷新和页面路径切换各上报一次；筛选参数、目录锚点、主题及侧栏开关不增加计数。统计请求本身会增加 PV，因此不轮询、不自动重试，也不要额外加载不蒜子的自动统计脚本。文章页虽然显示目录，仍会计入全站访问。

计数保存在第三方服务端，博客重新部署不会重置；此前未采集的访问不会补回。UV 按服务规则去重，仅供参考。加载或服务失败时显示 `—`，实际返回的零正常显示为 `0`。更换正式域名时需同步修改采集器的域名限制，并另行确认历史数据衔接。

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
