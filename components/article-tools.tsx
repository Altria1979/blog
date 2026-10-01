"use client";

import { useState } from "react";
import { Icon } from "./icon";
import { getMessages } from "@/lib/messages";
import { useLocale } from "./locale-provider";


export function ArticleTools({ title, description, url }: {
  title: string;
  description: string;
  url: string;
}) {
  const t = getMessages(useLocale());
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  async function copy() {
    try {
      await navigator.clipboard.writeText(`${title}\n\n${description ? `${description}\n\n` : ""}${url}`);
      setState("copied");
    } catch {
      setState("error");
    }
  }
  return (
    <button type="button" className="share-button" onClick={copy}
      title={state === "error" ? t.shareErrorHelp : t.shareDescription}
      aria-label={state === "error" ? t.shareErrorHelp : undefined}
    >
      <Icon
        name={state === "copied" ? "check" : "share"}
        width="16"
        height="16"
      />
      <span aria-live="polite">
        {state === "copied"
          ? t.copied
          : state === "error"
            ? t.copyFailed
            : t.shareText}
      </span>
    </button>
  );
}
