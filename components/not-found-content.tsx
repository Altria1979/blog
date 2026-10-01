"use client";
import Link from "next/link";
import { useLocale } from "./locale-provider";
import { localePath } from "@/lib/i18n";
import { Icon } from "./icon";

export function NotFoundContent() {
  const locale = useLocale();
  const text = {
    zh: ["这页故事，还没写好。", "也许地址变了，回首页看看其他文章吧。", "回到首页"],
    en: ["This story hasn’t been written yet.", "The address may have changed. Discover other posts on the home page.", "Back to home"],
    ja: ["この物語は、まだ書かれていません。", "アドレスが変わったのかもしれません。ホームで他の記事を探してみてください。", "ホームへ戻る"],
  }[locale];
  return <div className="not-found"><span>404</span><h1>{text[0]}</h1><p>{text[1]}</p>
    <Link className="primary-button" href={localePath("/", locale)}>{text[2]} <Icon name="arrow" width="17" height="17" /></Link>
  </div>;
}
