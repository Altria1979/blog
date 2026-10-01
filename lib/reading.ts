import type { Heading } from "./markdown";

export function matchesArticlePath(pathname: string, articlePath: string): boolean {
  if (pathname === articlePath) return true;
  try {
    return decodeURIComponent(pathname) === articlePath;
  } catch {
    return false;
  }
}

export function currentHeadingId(
  positions: { id: string; top: number }[],
  readingLine: number,
  viewportHeight: number,
  atPageEnd: boolean,
): string | null {
  const threshold = atPageEnd ? viewportHeight : readingLine;
  let current: string | null = null;
  for (const heading of positions) {
    if (heading.top <= threshold) current = heading.id;
  }
  return current;
}

/** Current section and its preceding, enclosing headings, in document order. */
export function activeHeadingIds(headings: Heading[], currentId: string | null): string[] {
  const currentIndex = headings.findIndex((heading) => heading.id === currentId);
  if (currentIndex < 0) return [];

  const active = [headings[currentIndex].id];
  let level = headings[currentIndex].level;
  for (let index = currentIndex - 1; index >= 0; index -= 1) {
    const heading = headings[index];
    if (heading.level < level) {
      active.unshift(heading.id);
      level = heading.level;
    }
  }
  return active;
}

/** Starts at body entry and finishes when the body bottom enters the viewport. */
export function articleProgress(bodyTop: number, bodyHeight: number, viewportHeight: number): number {
  if (bodyHeight <= 0 || viewportHeight <= 0) return 0;
  return Math.max(0, Math.min(1, (viewportHeight - bodyTop) / bodyHeight));
}
