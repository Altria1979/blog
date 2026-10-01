# 图片存储与管理

[返回项目介绍](../README.md)

图片由阿里云 OSS 托管，Bucket 为 `altria-blog-images-5225758`，地域为中国香港 `cn-hongkong`。仓库通过 `content/image-assets.json` 保存图片宽高、大小、SHA-256 和 MIME；图片二进制不随代码长期保存。

正文、封面、头像和分享图片继续使用 `/images/...` 逻辑路径，`lib/image-assets.ts` 默认映射到：

```text
https://altria-blog-images-5225758.oss-cn-hongkong.aliyuncs.com
```

例如 `/images/posts/nextjs-blog/wallhaven-y8137x.jpg` 对应[云端封面](https://altria-blog-images-5225758.oss-cn-hongkong.aliyuncs.com/images/posts/nextjs-blog/wallhaven-y8137x.jpg)。新检出仓库无需创建 `.env.local` 就能加载现有图片。使用 OSS 默认域名，不绑定自定义图片域名，也无需自行申请或续期 HTTPS 证书。默认域名的图片链接直接打开时可能触发下载，这是 OSS 的默认域名行为。

需要切换图片来源时，可在 `.env.local` 和部署平台覆盖 `NEXT_PUBLIC_IMAGE_BASE_URL`，然后重新构建。值必须为 HTTPS origin，不能包含子路径、端口、凭据、查询参数或片段。当前 `images.unoptimized: true` 让浏览器直连 OSS，复制图片地址得到 OSS 原始 URL。配置中保留的 `remotePatterns` 和跳转限制仅用于 Next 图片优化器，直连模式不执行这些服务端限制。显式设置 `NEXT_PUBLIC_IMAGE_BASE_URL=` 会回退本地路径，使用前必须先将图片恢复到 `public/images/`；不设置此变量才使用默认 OSS 地址。

## 查看与下载

以下命令需要安装阿里云 CLI 并完成 OAuth 登录，使用 `aliyun ossutil` 管理图片，不需要在项目中保存 AccessKey。命令在项目根目录执行：

```sh
# 列出云端图片
aliyun ossutil ls oss://altria-blog-images-5225758/images/ \
  --region cn-hongkong

# 查看一张图片的大小、类型和缓存信息
aliyun ossutil stat \
  oss://altria-blog-images-5225758/images/posts/nextjs-blog/wallhaven-y8137x.jpg \
  --region cn-hongkong

# 下载到仓库外，保留 images/ 下的目录结构
aliyun ossutil cp \
  oss://altria-blog-images-5225758/images/ \
  "$HOME/Downloads/altria-blog-images/" \
  --recursive --region cn-hongkong
```

## 发布新图片

1. 将新图暂存为 `public/images/posts/hello-world/cover.jpg` 等路径。替换已有图片时建议使用新文件名，避免缓存继续显示旧内容。
2. 运行 `npm run images:manifest`，登记本地图片的尺寸和校验信息。重新运行会保留已迁移图片的记录，不要求旧图片仍在本地。
3. 上传暂存目录，保持对象键的 `images/` 前缀：

```sh
npm run images:manifest
aliyun ossutil cp public/images/ \
  oss://altria-blog-images-5225758/images/ \
  --recursive --region cn-hongkong \
  --cache-control 'public, max-age=86400'
```

4. 用 `stat` 检查每张新图的大小和 `Content-Type`，再通过公开 URL 下载并校验 SHA-256。下面以新增封面为例；三份文件的 SHA-256 应相同，并与 `content/image-assets.json` 对应记录一致：

```sh
ALTRIA_VERIFY_DIR="$(mktemp -d)"
aliyun ossutil stat \
  oss://altria-blog-images-5225758/images/posts/hello-world/cover.jpg \
  --region cn-hongkong
aliyun ossutil cp \
  oss://altria-blog-images-5225758/images/posts/hello-world/cover.jpg \
  "$ALTRIA_VERIFY_DIR/cover-cli.jpg" --region cn-hongkong
curl --fail --show-error --silent \
  --dump-header "$ALTRIA_VERIFY_DIR/headers.txt" \
  --output "$ALTRIA_VERIFY_DIR/cover-public.jpg" \
  https://altria-blog-images-5225758.oss-cn-hongkong.aliyuncs.com/images/posts/hello-world/cover.jpg
shasum -a 256 public/images/posts/hello-world/cover.jpg \
  "$ALTRIA_VERIFY_DIR/cover-cli.jpg" "$ALTRIA_VERIFY_DIR/cover-public.jpg"
cat "$ALTRIA_VERIFY_DIR/headers.txt"
```

5. 确认匿名下载成功、响应类型正确、校验值一致，并在文章页检查显示效果后，将暂存图片移至仓库外的备份目录。提交 Markdown 和更新后的 `content/image-assets.json`，不要提交图片二进制。重新构建即可发布；清单会继续为正文图片提供宽高。

图床提供存储和访问地址，不自动压缩、裁剪图片。当前 Next Image 也不再动态压缩、缩放或转换格式，上传前应准备合适尺寸和体积的图片；正文保留懒加载和灯箱。Bucket 仅对 `images/*` 开放匿名读取；上传和管理操作使用 CLI 登录。OAuth 凭据、AccessKey、API Token 不能放入 `NEXT_PUBLIC_` 变量、文章或代码仓库。OSS 并非所有用量都免费，免费额度和超额费用以[阿里云官方说明](https://help.aliyun.com/zh/oss/free-quota-for-new-users)及账号账单为准。

## 素材来源

当前头像 `/images/avatar-altria.jpg` 使用用户提供的 `IMG_5614.jpg`，图片保存在 OSS。

Next.js 建站文章封面使用用户提供的 `wallhaven-y8137x.jpg`，其图片授权独立于网站代码许可。

示例照片来自 Unsplash，按 [Unsplash License](https://unsplash.com/license) 使用。正式发布时可换成自己的图片。当前图片 ID：

| 图片文件 | 原始图片 |
| --- | --- |
| desk.jpg | [photo-1496181133206-80ce9b88a853](https://images.unsplash.com/photo-1496181133206-80ce9b88a853) |
| mountains.jpg | [photo-1464822759023-fed622ff2c3b](https://images.unsplash.com/photo-1464822759023-fed622ff2c3b) |
| sea.jpg | [photo-1518837695005-2083093ee35b](https://images.unsplash.com/photo-1518837695005-2083093ee35b) |
| avatar.jpg | [photo-1511044568932-338cba0ad803](https://images.unsplash.com/photo-1511044568932-338cba0ad803) |
