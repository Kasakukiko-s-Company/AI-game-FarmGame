import assert from 'node:assert/strict';
import test from 'node:test';
import {
  isTileFarmable,
  type TileFarmabilityMap,
} from '../../assets/scripts/world/TileFarmability.ts';

const FARM_MAP: TileFarmabilityMap = {
  width: 30,
  height: 30,
  farmableArea: {
    min: { x: 5, y: 5 },
    max: { x: 14, y: 14 },
  },
  isBlocked: () => false,
};

test('allows tiles throughout the inclusive configured farmable area', () => {
  assert.deepEqual(
    [
      isTileFarmable({ x: 5, y: 5 }, FARM_MAP),
      isTileFarmable({ x: 14, y: 5 }, FARM_MAP),
      isTileFarmable({ x: 5, y: 14 }, FARM_MAP),
      isTileFarmable({ x: 14, y: 14 }, FARM_MAP),
      isTileFarmable({ x: 9, y: 10 }, FARM_MAP),
    ],
    [true, true, true, true, true],
  );
});

test('rejects null, non-integer, and out-of-map target tiles', () => {
  const unsafeAreaMap: TileFarmabilityMap = {
    width: 3,
    height: 2,
    farmableArea: {
      min: { x: -1, y: -1 },
      max: { x: 3, y: 2 },
    },
    isBlocked: () => false,
  };

  assert.deepEqual(
    [
      isTileFarmable(null, unsafeAreaMap),
      isTileFarmable({ x: -1, y: 0 }, unsafeAreaMap),
      isTileFarmable({ x: 3, y: 0 }, unsafeAreaMap),
      isTileFarmable({ x: 0, y: -1 }, unsafeAreaMap),
      isTileFarmable({ x: 0, y: 2 }, unsafeAreaMap),
      isTileFarmable({ x: 0.5, y: 0 }, unsafeAreaMap),
      isTileFarmable({ x: 0, y: 1.5 }, unsafeAreaMap),
    ],
    [false, false, false, false, false, false, false],
  );
});

test('rejects a blocked tile inside the farmable area without rejecting its neighbor', () => {
  const mapWithBlocking: TileFarmabilityMap = {
    ...FARM_MAP,
    isBlocked: (tileX, tileY) => tileX === 9 && tileY === 10,
  };

  assert.deepEqual(
    [
      isTileFarmable({ x: 9, y: 10 }, mapWithBlocking),
      isTileFarmable({ x: 10, y: 10 }, mapWithBlocking),
    ],
    [false, true],
  );
});
