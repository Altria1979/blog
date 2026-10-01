import { blogConfig } from "@/blog.config";
import { getPosts } from "@/lib/posts";
import { formatDate } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { getMessages } from "@/lib/messages";
import { TechnicalInfo } from "./technical-info";
import { BlogStats } from "./blog-stats";

export function InfoSidebar({ locale = "zh" }: { locale?: Locale }) {
  const posts = getPosts();
  return (
    <aside className="info-sidebar">
      <BlogStats
        locale={locale}
        established={blogConfig.established}
        builtAt={process.env.NEXT_PUBLIC_BLOG_BUILD_TIME ?? ""}
        totalWords={posts.reduce((sum, post) => sum + post.wordCount, 0)}
      />
      <TechnicalInfo locale={locale} />

    </aside>
  );
}

export function SiteFooter({ locale = "zh" }: { locale?: Locale }) {
  const t = getMessages(locale);
  const posts = getPosts();
  return (
    <footer className="site-footer">
      <div className="site-footer-identity">
        <p className="site-footer-note">{t.footerNote}</p>
        <span>© 2026 {blogConfig.author}</span>
      </div>
      <div className="site-footer-details">
        <span>
          {t.designReferenceBefore}{" "}
          <a
            href="https://github.com/senshinya/blog"
            target="_blank"
            rel="noopener noreferrer"
          >
            Clarity
          </a>{" "}
          {t.designReferenceAfter}
        </span>
        {posts[0] && <time dateTime={posts[0].date}>{t.lastUpdated(formatDate(posts[0].date, false, locale))}</time>}
      </div>
    </footer>
  );
}
