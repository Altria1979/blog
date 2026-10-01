import type { Metadata, Viewport } from "next";
import { blogConfig } from "@/blog.config";
import { getPosts, getTranslationManifest } from "@/lib/posts";
import { getHeadings, parseMarkdown, splitContentSlots } from "@/lib/markdown";
import { MarkdownSlot } from "./markdown";
import { languageTag, localePath, type Locale } from "@/lib/i18n";
import { siteDescriptions } from "@/lib/metadata";
import { Sidebar } from "./sidebar";
import { InfoSidebar, SiteFooter } from "./info-sidebar";
import { ReadingAside } from "./reading-navigation";
import { LocaleProvider } from "./locale-provider";
import "@/app/globals.css";
import "@/app/reading.css";
import "@/app/i18n.css";

export function siteMetadata(locale: Locale): Metadata {
  return {
    metadataBase: new URL(blogConfig.url),
    title: { default: blogConfig.title, template: `%s · ${blogConfig.title}` },
    description: siteDescriptions[locale], authors: [{ name: blogConfig.author }],
    alternates: { types: { "application/rss+xml": localePath("/rss.xml", locale) } },
  };
}
export const siteViewport: Viewport = {
  width: "device-width", initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "hsl(220 20% 98%)" },
    { media: "(prefers-color-scheme: dark)", color: "hsl(220 10% 10%)" },
  ],
};
const themeScript = `(function(){var r=document.documentElement;var t='system';try{t=localStorage.getItem('blog-theme')||'system'}catch(e){}r.dataset.preference=t;r.dataset.theme=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light';matchMedia('(prefers-color-scheme: dark)').addEventListener('change',function(e){if(r.dataset.preference==='system')r.dataset.theme=e.matches?'dark':'light'})})()`;

export function SiteLayout({ children, locale }: { children: React.ReactNode; locale: Locale }) {
  const posts = getPosts(undefined, locale);
  const summaries = posts.map(({ slug, title, description, category, tags, locale }) => ({ slug, title, description, category, tags, locale }));
  return (
    <html lang={languageTag(locale)} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <LocaleProvider locale={locale}>
          <a className="skip-link" href="#main-content">{{ zh: "跳到正文", en: "Skip to content", ja: "本文へスキップ" }[locale]}</a>
          <div className="blog-layout">
            <Sidebar posts={summaries} translations={getTranslationManifest()} />
            <main id="main-content" className="main-content">
              {children}
            </main>
            <ReadingAside articles={posts.map((post) => {
              const slots = Object.fromEntries(Object.entries(splitContentSlots(parseMarkdown(post.content)).slots).map(([name, block]) => [`meta-${name}`, block]));
              const order = post.aside ?? ["toc", ...Object.keys(slots).filter(name => name.startsWith("meta-aside-"))];
              const tocIndex = order.indexOf("toc");
              const widgets = (names: string[]) => names.filter(name => slots[name]).map(name => <MarkdownSlot key={name} block={slots[name]} />);
              return { path: localePath(`/posts/${post.slug}`, locale), headings: getHeadings(post.content), showContents: tocIndex >= 0,
                beforeContents: widgets(tocIndex < 0 ? order : order.slice(0, tocIndex)), afterContents: widgets(tocIndex < 0 ? [] : order.slice(tocIndex + 1)) };
            })}>
              <InfoSidebar locale={locale} />
            </ReadingAside>
            <SiteFooter locale={locale} />
          </div>
        </LocaleProvider>
      </body>
    </html>
  );
}
