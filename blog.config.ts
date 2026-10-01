import { defaultImageBaseUrl, imageBaseUrl, imageUrl } from "./lib/image-assets";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const imageOrigin = imageBaseUrl();

export const blogConfig = {
  title: "Altria",
  author: "Altria",
  tagline: "万事万物皆有数, 希望你心里也有",
  description: "Altria 的个人博客，分享前端开发、技术探索和生活里的小事。",
  url: new URL(siteUrl).origin,
  established: "2026-09-30",
  avatar: imageUrl("/images/avatar-altria.jpg"),
  // 品牌背景装饰；设为空数组可关闭。
  brandEmojis: ["💻", "🎧", "📷", "🍃", "✨"],
  // 填写自己的地址后，侧栏会自动显示对应链接。
  github: "https://github.com/Altria1979",
  telegram: "https://telegram.me/altria1979",
  email: "hakusai22@qq.com",
  technical: {
    // 留空时按构建环境显示 Vercel 或 Node.js。
    buildPlatform: "",
    imageStorage: imageOrigin === defaultImageBaseUrl ? "阿里云 OSS" : imageOrigin ? "外部图床" : "本站托管",
    // 填写本站实际采用的许可；留空时显示「未声明」。
    softwareLicense: "",
    contentLicense: "",
  },
  interests: ["前端开发", "开源", "摄影", "音乐", "慢慢生活"],
};
