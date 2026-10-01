# Altria Blog

> 万事万物皆有数，希望你心里也有。

Altria 的个人博客，用来记录前端开发、技术实践、年度总结，以及生活和旅行中的见闻，也作为学习和实践 Next.js 的个人项目。

博客的布局、阅读体验与交互主要参考声哥的开源项目 [senshinya/blog](https://github.com/senshinya/blog)（[信也のブログ](https://blog.shinya.click/)），结合自己的内容，使用 Next.js 和 React 实现。

## 当前功能

- 文章列表、分类与标签筛选、标题与摘要等元信息搜索、按年归档和关于页。
- Markdown 富内容文章，支持代码高亮、公式、图表、乐谱和图片灯箱。
- 中文、英文、日文界面与独立文章译文，浅色、深色和跟随系统主题。
- 分语言 RSS、站点地图及文章 SEO。

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
