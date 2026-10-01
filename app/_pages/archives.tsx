import Link from "next/link";
import { Icon } from "@/components/icon";
import { formatDate } from "@/lib/format";
import { getCategories, getPosts } from "@/lib/posts";
import { categoryLabel, localePath, type Locale } from "@/lib/i18n";
import { getPageMessages } from "@/lib/page-messages";

export default function ArchivesPage({ locale = "zh" }: { locale?: Locale }) {
  const posts = getPosts(undefined, locale);
  const categories = getCategories(undefined, locale);
  const messages = getPageMessages(locale).archives;
  const years = [...new Set(posts.map((post) => post.date.slice(0, 4)))].sort(
    (a, b) => Number(b) - Number(a),
  );

  return (
    <>
      <header>
        <h1 className="page-heading">{messages.title}</h1>
        <p className="page-description">{messages.summary(posts.length)}</p>
      </header>
      <section className="surface" aria-label={messages.categories}>
        <h2>
          <Icon name="folder" /> {messages.browseCategories}
        </h2>
        <div className="about-facts">
          {categories.map((category) => (
            <Link
              key={category.name}
              className="tag-chip category-label"
              data-category={category.name}
              href={localePath(`/?category=${encodeURIComponent(category.name)}`, locale)}
            >
              {categoryLabel(category.name, locale)} · {category.count}
            </Link>
          ))}
        </div>
      </section>
      <section className="surface" aria-label={messages.byYear}>
        {years.map((year) => (
          <section key={year}>
            <h2 className="archive-year">
              {year}
              <span>
                {messages.postCount(posts.filter((post) => post.date.startsWith(year)).length)}
              </span>
            </h2>
            <ul className="archive-list">
              {posts
                .filter((post) => post.date.startsWith(year))
                .map((post) => (
                  <li key={post.slug}>
                    <Link className="archive-row" href={localePath(`/posts/${post.slug}`, locale)}>
                      <time dateTime={post.date}>{formatDate(post.date, false, locale)}</time>
                      <span>{post.title}</span>
                      <span className="tag-chip category-label" data-category={post.category}>{categoryLabel(post.category, locale)}</span>
                      <Icon name="arrow" />
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))}
        {posts.length === 0 && (
          <p className="page-description">{messages.empty}</p>
        )}
      </section>
    </>
  );
}
