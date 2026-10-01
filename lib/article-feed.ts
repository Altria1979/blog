const pageSize = 10;

export function articlePage(itemCount: number, query: string | null) {
  const pageCount = Math.max(1, Math.ceil(itemCount / pageSize));
  const requested = Number(query);
  const page = Number.isInteger(requested) && requested > 0
    ? Math.min(pageCount, requested)
    : 1;
  return { page, pageCount, start: (page - 1) * pageSize, end: page * pageSize };
}

export function paginationItems(page: number, pageCount: number): (number | "ellipsis")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1);
  const start = Math.max(1, Math.min(page - 2, pageCount - 4));
  const end = Math.min(pageCount, start + 4);
  const items: (number | "ellipsis")[] = [];
  if (start > 1) items.push(1);
  if (start > 2) items.push("ellipsis");
  for (let number = start; number <= end; number++) items.push(number);
  if (end < pageCount - 1) items.push("ellipsis");
  if (end < pageCount) items.push(pageCount);
  return items;
}
