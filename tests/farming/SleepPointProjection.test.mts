import assert from 'node:assert/strict';
import test from 'node:test';
import { createSleepPointPatch } from '../../assets/scripts/farming/SleepPointProjection.ts';

const GRID = {
  width: 30,
  height: 30,
  tileWidth: 32,
  tileHeight: 32,
  origin: { x: -480, y: -480 },
} as const;

test('projects the configured sleep tile into one map-local rectangle', () => {
  assert.deepEqual(createSleepPointPatch({ x: 15, y: 22 }, GRID), {
    tileX: 15,
    tileY: 22,
    left: 0,
    bottom: 224,
    width: 32,
    height: 32,
  });
});

test('does not draw an invalid or out-of-bounds sleep point', () => {
  assert.equal(createSleepPointPatch({ x: 30, y: 22 }, GRID), null);
  assert.equal(createSleepPointPatch({ x: 15.5, y: 22 }, GRID), null);
});
