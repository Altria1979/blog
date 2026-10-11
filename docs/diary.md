# 日记写作指南

日记通过 Markdown 随博客构建发布，支持纯文字、纯图片、图文穿插和现有安全 Markdown 语法。标题可省略，正文完整展示，按上海时间分月、倒序排列，每页 10 条。日记不计入文章数量、文章归档、文章搜索或文章 RSS。

## 文件与语言

在仓库的 `content/diary/` 中一篇建一个 `.md` 文件。中文放在根目录，英文放在 `en/`，日文放在 `ja/`。文件名是稳定标识，建议使用 `2026-10-11-evening.md` 一类名称；同一天可以使用不同文件名写多条。

三种语言分别展示对应的已发布内容，没有译文时显示该语言的空状态。界面切换回到对应语言日记的第一页。

元数据：

| 字段 | 说明 |
| --- | --- |
| `date` | 必填。`2026-10-11` 表示上海时间当天；带时间必须注明时区，例如 `2026-10-11T18:30:00+08:00`。不带时间时不显示钟点。 |
| `title` | 可选。不填时直接展示日期与正文。 |
| `draft` | `true` 隐藏草稿；省略或 `false` 表示公开发布。 |
| `locale` | 可选，默认由目录决定；填写时必须与目录语言一致。 |
| `translationKey` | 可选，默认文件名（不含 `.md`）；同篇译文使用相同值。 |

同篇译文记录相同的原始日期、时间精度（都填时间或都不填），不要使用翻译完成时间。同一语言不允许出现两个相同 `translationKey` 的公开条目，否则构建报错；已发布译文日期不一致也会报错。草稿、无效日期和空内容不会公开，草稿在本地日记页同样隐藏。

## 三语模板

以下为写作示例，不会自动进入网站。三份示例默认设为草稿；用自己的内容替换后，移除 `draft: true` 即可发布。

中文 `content/diary/2026-10-11-evening.md`：

```markdown
---
date: 2026-10-11T18:30:00+08:00
translationKey: 2026-10-11-evening
draft: true
---

傍晚出去走了一会儿，风已经有一点凉了。

![傍晚散步时的天空](/images/diary/2026-10-11-evening/sky.jpg)

把这一刻记下来。
```

英文 `content/diary/en/2026-10-11-evening.md`：

```markdown
---
date: 2026-10-11T18:30:00+08:00
translationKey: 2026-10-11-evening
locale: en
draft: true
---

I took a short walk this evening. There was already a chill in the air.

![The sky during an evening walk](/images/diary/2026-10-11-evening/sky.jpg)

A small moment to remember.
```

日文 `content/diary/ja/2026-10-11-evening.md`：

```markdown
---
date: 2026-10-11T18:30:00+08:00
translationKey: 2026-10-11-evening
locale: ja
draft: true
---

夕方、少し散歩した。風がもう少し冷たくなっていた。

![夕方の散歩で見上げた空](/images/diary/2026-10-11-evening/sky.jpg)

このひとときを書き留めておく。
```

图片文件可共用，说明文字随正文翻译。只发布已准备好的语言即可，其他语言不自动展示中文或生成翻译。

## 图片与发布

1. 按 [图片存储与管理](image-storage.md) 的现有流程，将新图片暂存到 `public/images/diary/<日记标识>/`，运行 `npm run images:manifest`。
2. 上传至现有 OSS 对应的 `images/diary/<日记标识>/` 对象路径，检查允许来源下的可访问性、尺寸与校验值。
3. Markdown 使用 `/images/diary/...` 逻辑路径，连续图片自动排成图组，点击可放大；文字和图片顺序按正文保留。
4. 图片备份到仓库外，提交 Markdown 与 `content/image-assets.json`，图片二进制不入库。文章和日记共用图片发布流程。
5. 运行 `npm run lint`、`npm run typecheck`、`npm test`、`npm run build`。确认各语言预览后，沿用博客现有发布流程。

没有内容时页面正常显示空状态。首版不提供在线编辑、私密访问、评论、点赞或独立详情页。
