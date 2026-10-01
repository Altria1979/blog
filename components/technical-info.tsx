import { arch, platform, versions } from "node:process";
import { version as nextVersion } from "next/package.json";
import { version as reactVersion } from "react/package.json";
import { version as blogVersion } from "@/package.json";
import { blogConfig } from "@/blog.config";
import type { Locale } from "@/lib/i18n";
import { getMessages } from "@/lib/messages";

export function TechnicalInfo({ locale = "zh" }: { locale?: Locale }) {
  const t = getMessages(locale);
  const service = [
    [t.buildPlatform, blogConfig.technical.buildPlatform || (process.env.VERCEL === "1" ? "Vercel" : "Node.js")],
    [t.imageStorage, blogConfig.technical.imageStorage === "本站托管" ? t.selfHosted : blogConfig.technical.imageStorage],
    [t.softwareLicense, blogConfig.technical.softwareLicense || t.unspecified],
    [t.contentLicense, blogConfig.technical.contentLicense || t.unspecified],
    [t.canonicalDomain, new URL(blogConfig.url).host],
  ];
  const build = [
    ["Blog", blogVersion],
    ["Next.js", nextVersion],
    ["React", reactVersion],
    ["Node.js", versions.node],
    ["OS", platform],
    ["Arch", arch],
  ];

  return (
    <section className="technical-info" aria-labelledby="technical-info-title">
      <h2 id="technical-info-title" className="side-heading">{t.technicalInfo}</h2>
      <div className="technical-panel">
        <dl className="technical-list">
          {service.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
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
