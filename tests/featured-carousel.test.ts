import assert from "node:assert/strict";
import test from "node:test";
import { horizontalWheelDelta, loopedScrollPosition } from "../lib/featured-carousel.ts";

test("loop boundaries preserve the same card sequence with two or three articles", () => {
  for (const count of [2, 3, 8]) {
    const step = 208;
    const group = count * step;
    const home = group * 2;
    assert.equal(loopedScrollPosition(home, group), home);
    assert.equal(loopedScrollPosition(home - step, group), home + group - step);
    assert.equal(loopedScrollPosition(home + group, group), home);
    assert.equal(loopedScrollPosition(home + group * 20 + 17, group), home + 17);
    assert.equal(loopedScrollPosition(home - group * 20 - 17, group), home + group - 17);
    for (let index = -20; index < 20; index++) {
      const position = loopedScrollPosition(home + step * index, group);
      assert.ok(position >= home && position < home + group);
      assert.equal((position - home) / step, ((index % count) + count) % count);
    }
  }
  assert.equal(loopedScrollPosition(100, 0), 0);
});

test("wheel routing only takes horizontal intent, including browser-mapped Shift gestures", () => {
  const wheel = { deltaX: 0, deltaY: 120, shiftKey: false, ctrlKey: false };
  assert.equal(horizontalWheelDelta(wheel), 0);
  assert.equal(horizontalWheelDelta({ ...wheel, deltaX: 5 }), 0);
  assert.equal(horizontalWheelDelta({ ...wheel, shiftKey: true }), 120);
  assert.equal(horizontalWheelDelta({ ...wheel, deltaY: 0, deltaX: -120, shiftKey: true }), -120);
  assert.equal(horizontalWheelDelta({ ...wheel, deltaY: 5, deltaX: -120 }), -120);
  assert.equal(horizontalWheelDelta({ ...wheel, deltaX: 200, ctrlKey: true }), 0);
});
