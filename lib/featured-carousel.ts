/** Keep an equivalent card sequence in the middle copy, including large wheel deltas. */
export function loopedScrollPosition(position: number, groupWidth: number) {
  if (groupWidth <= 0) return 0;
  const home = groupWidth * 2;
  return home + (((position - home) % groupWidth) + groupWidth) % groupWidth;
}

/** Vertical page scrolling and trackpad pinch gestures must remain native. */
export function horizontalWheelDelta({
  deltaX,
  deltaY,
  shiftKey,
  ctrlKey,
}: Pick<WheelEvent, "deltaX" | "deltaY" | "shiftKey" | "ctrlKey">) {
  if (ctrlKey) return 0;
  if (shiftKey) return Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
  return Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : 0;
}
