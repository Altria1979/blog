import Image from "next/image";
import Link from "next/link";
import { blogConfig } from "@/blog.config";
import { Icon } from "@/components/icon";
import { localePath, tagLabel, type Locale } from "@/lib/i18n";
import { getPageMessages } from "@/lib/page-messages";

export default function AboutPage({ locale = "zh" }: { locale?: Locale }) {
  const messages = getPageMessages(locale).about;
  return (
    <>
      <header>
        <h1 className="page-heading">{messages.title}</h1>
        <p className="page-description">{messages.welcome}</p>
      </header>
      <section className="surface">
        <div className="about-profile">
          <Image
            src={blogConfig.avatar}
            alt={messages.avatar(blogConfig.author)}
            width={88}
            height={88}
          />
          <div>
            <h2>{blogConfig.author}</h2>
          </div>
        </div>
        <div className="about-facts">
          {blogConfig.interests.map((interest) => (
            <span className="tag-chip" key={interest}>
              {tagLabel(interest, locale)}
            </span>
          ))}
        </div>
        <div className="prose">
          <h2>{messages.profileTitle}</h2>
          <p>{messages.profileIntro}</p>
          <p>{messages.gamesIntro}</p>
          <h2>{messages.recordTitle}</h2>
          <p>{messages.recordIntro}</p>
          <p>{messages.recordDetails}</p>
          <h2>{messages.siteTitle}</h2>
          <p>{messages.siteIntro}</p>
          <p>{messages.siteDetails}</p>
          <h2>{messages.contactTitle}</h2>
          <p>
            {messages.contactBefore}
            <Link href={localePath("/rss.xml", locale)}>{messages.subscribe}</Link>
            {messages.contactAfter}
          </p>
          {(blogConfig.github || blogConfig.email) && (
            <p className="about-facts">
              {blogConfig.github && (
                <a
                  href={blogConfig.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="github" /> GitHub
                </a>
              )}
              {blogConfig.email && (
                <a href={`mailto:${blogConfig.email}`}>
                  <Icon name="mail" /> {messages.email}
                </a>
              )}
            </p>
          )}
        </div>
      </section>
    </>
  );
}
