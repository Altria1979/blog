import type { SVGProps } from "react";

const paths = {
  panelLeft: "M4 4h16v16H4zM9 4v16",
  panelRight: "M4 4h16v16H4zM15 4v16",
  pencil: "m16 3 5 5M4 15 16 3a2 2 0 0 1 3 0l2 2a2 2 0 0 1 0 3L9 20l-6 1 1-6ZM13 21h8",
  pilcrow: "M13 4v16M18 4v16M21 4H9a5 5 0 0 0 0 10h4",
  share: "M6 12 18 5M6 12l12 7M8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0M20 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0M20 19a2 2 0 1 1-4 0 2 2 0 0 1 4 0",
  sparkle: "m12 3 3 6 6 3-6 3-3 6-3-6-6-3 6-3 3-6ZM20 2v4M18 4h4",
  tool: "M14 6a5 5 0 0 0-6 6L3 17a3 3 0 0 0 4 4l5-5a5 5 0 0 0 6-6l-4 2-2-2 2-4Z",
  posts:
    "M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3M8 2h7l6 6v6a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V2Zm7 0v6h6",
  archive: "M3 3h18v5H3zM5 8v13h14V8M10 12h4",
  link: "m10 13 4-4M8 16l-2 2a4.24 4.24 0 0 1-6-6l4-4a4.24 4.24 0 0 1 6 0M16 8l2-2a4.24 4.24 0 0 1 6 6l-4 4a4.24 4.24 0 0 1-6 0",
  user: "M20 21v-2a7 7 0 0 0-14 0v2M17 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  search: "M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  sun: "M12 3V1M12 23v-2M3 12H1M23 12h-2M4.2 4.2 1.4 1.4M18.4 18.4l1.4 1.4M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  moon: "M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z",
  monitor: "M3 3h18v14H3zM8 21h8M12 17v4",
  rss: "M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16M5 20a1 1 0 1 1-2 0 1 1 0 0 1 2 0",
  github:
    "M9 19c-4 1-4-2-6-2M15 22v-4c0-1-.3-2-1-2.5 4-.4 7-2 7-6a5 5 0 0 0-1.5-3.5c.4-1.2.2-2.5-.4-3.5-2-.1-3 1-4 1.5a13 13 0 0 0-6 0C8 3.5 7 2.5 5 2.5c-.6 1-.8 2.3-.4 3.5A5 5 0 0 0 3 9.5c0 4 3 5.6 7 6-.7.5-1 1.5-1 2.5v4",
  telegram: "m21 3-4 18-6-5-4 4v-7l-5-3 19-7ZM7 13 21 3M7 20l4-4",
  mail: "M3 5h18v14H3zM3 5l9 7 9-7",
  arrow: "M5 12h14M13 6l6 6-6 6",
  chevron: "m9 5 7 7-7 7",
  folder: "M3 5h6l2 2h10v13H3z",
  tag: "m3 3 8 0 10 10-8 8L3 11V3ZM7 7h.01",
  calendar: "M3 5h18v16H3zM16 3v4M8 3v4M3 11h18",
  clock: "M12 8v4l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  close: "m6 6 12 12M6 18 18 6",
  menu: "M3 6h18M3 12h18M3 18h18",
  check: "m5 12 4 4L19 6",
  copy: "M8 8h13v13H8zM16 8V3H3v13h5",
  coffee:
    "M3 8h13v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8ZM16 8h2a3 3 0 0 1 0 6h-2M6 1v3M10 1v3M14 1v3",
} as const;

export type IconName = keyof typeof paths;
export function Icon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & { name: IconName }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  );
}
