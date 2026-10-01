import type { InlineNode, MarkdownBlock } from "./markdown";

function paragraphImages(nodes: InlineNode[]) {
  if (!nodes.every(node => (node.type === "image" && !node.attrs?.class && !node.attrs?.style && !node.attrs?.id) || (node.type === "text" && !node.value.trim())))
    return undefined;
  const images = nodes.filter(node => node.type === "image");
  return images.length ? images : undefined;
}

export function getImageRow(nodes: InlineNode[]) {
  const images = paragraphImages(nodes);
  return images && images.length > 1 ? images : undefined;
}

/** Group only adjacent photo paragraphs, within the current block/list-item scope. */
export function groupImageParagraphs(blocks: MarkdownBlock[]): MarkdownBlock[] {
  const grouped: MarkdownBlock[] = [];
  let pending: InlineNode[] = [];
  const flush = () => {
    if (pending.length) grouped.push({ type: "paragraph", children: pending });
    pending = [];
  };
  for (const block of blocks) {
    const images = block.type === "paragraph" ? paragraphImages(block.children) : undefined;
    if (images) pending.push(...images);
    else {
      flush();
      grouped.push(block);
    }
  }
  flush();
  return grouped;
}

type ImageSize = { width?: number; height?: number };

function orientation(image: ImageSize | undefined) {
  if (!image?.width || !image.height) return undefined;
  return image.width >= image.height ? "landscape" : "portrait";
}

/** Keep related orientations together, then balance rows to avoid a trailing lone photo. */
export function splitImageRows<T extends ImageSize>(images: T[]): T[][] {
  const groups: T[][] = [];
  let group: T[] = [];
  for (let index = 0; index < images.length; index += 1) {
    const current = orientation(images[index]);
    const previous = orientation(images[index - 1]);
    if (group.length >= 2 && current && previous && current !== previous && current === orientation(images[index + 1])) {
      groups.push(group);
      group = [];
    }
    group.push(images[index]);
  }
  if (group.length) groups.push(group);

  const rows: T[][] = [];
  for (const images of groups) {
    let offset = 0;
    for (let remaining = Math.ceil(images.length / 4); remaining > 0; remaining -= 1) {
      const count = Math.ceil((images.length - offset) / remaining);
      rows.push(images.slice(offset, offset + count));
      offset += count;
    }
  }
  return rows;
}
