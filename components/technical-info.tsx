import { arch, platform, versions } from "node:process";
import { version as nextVersion } from "next/package.json";
import { version as reactVersion } from "react/package.json";
import { version as typescriptVersion } from "typescript/package.json";
import { version as shikiVersion } from "shiki/package.json";
import { version as katexVersion } from "katex/package.json";
import { version as mermaidVersion } from "mermaid/package.json";
import { version as abcjsVersion } from "abcjs/package.json";
import { version as blogVersion } from "@/package.json";
import { blogConfig } from "@/blog.config";
import type { Locale } from "@/lib/i18n";
import { getMessages } from "@/lib/messages";
import { Icon } from "./icon";
import { TechnicalBrandIcon, type TechnicalBrandName } from "./technical-brand-icon";

type ServiceItem = { label: string; value: string; icon?: TechnicalBrandName; fallbackIcon?: "monitor" | "archive" };

export function TechnicalInfo({ locale = "zh" }: { locale?: Locale }) {
  const t = getMessages(locale);
  const buildPlatform = blogConfig.technical.buildPlatform || (process.env.VERCEL === "1" ? "Vercel" : "Node.js");
  const service: ServiceItem[] = [
    { label: t.buildPlatform, value: buildPlatform, icon: buildPlatform === "Vercel" ? "vercel" : buildPlatform === "Node.js" ? "nodejs" : undefined, fallbackIcon: "monitor" },
    { label: t.imageStorage, value: blogConfig.technical.imageStorage === "本站托管" ? t.selfHosted : blogConfig.technical.imageStorage, icon: blogConfig.technical.imageStorage === "阿里云 OSS" ? "aliyun" : undefined, fallbackIcon: "archive" },
    { label: t.dnsProvider, value: blogConfig.technical.dnsProvider, icon: "cloudflare" },
    { label: t.trafficStats, value: blogConfig.technical.analytics, icon: "supabase" },
    { label: t.database, value: "PostgreSQL" },
    { label: t.softwareLicense, value: blogConfig.technical.softwareLicense || t.unspecified },
    { label: t.contentLicense, value: blogConfig.technical.contentLicense || t.unspecified },
    { label: t.canonicalDomain, value: new URL(blogConfig.url).host },
  ];
  const build = [
    ["Blog", blogVersion],
    ["Next.js", nextVersion],
    ["React", reactVersion],
    ["TypeScript", typescriptVersion],
    ["Node.js", versions.node],
    ["Markdown", "unified / remark"],
    ["Shiki", shikiVersion],
    ["KaTeX", katexVersion],
    ["Mermaid", mermaidVersion],
    ["abcjs", abcjsVersion],
    ["OS", platform],
    ["Arch", arch],
  ];

  return (
    <section className="technical-info" aria-labelledby="technical-info-title">
      <h2 id="technical-info-title" className="side-heading">{t.technicalInfo}</h2>
      <div className="technical-panel">
        <dl className="technical-list">
          {service.map(({ label, value, icon, fallbackIcon }) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>
                {icon ? <TechnicalBrandIcon name={icon} /> : fallbackIcon && <Icon name={fallbackIcon} className="technical-brand-icon" />}
                <span>{value}</span>
              </dd>
            </div>
          ))}
        </dl>
        <details className="technical-build">
          <summary>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m6 5 6 6 6-6M6 12l6 6 6-6" />
            </svg>
            <span className="technical-expand">{t.expandBuild}</span>
            <span className="technical-collapse">{t.collapseBuild}</span>
          </summary>
          <dl className="technical-build-list">
            {build.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </details>
      </div>
    </section>
  );
}
