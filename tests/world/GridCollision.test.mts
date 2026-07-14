import assert from 'node:assert/strict';
import test from 'node:test';
import {
  convertBottomTileYToTiledRow,
  resolveGridMovement,
  type TileCollisionMap,
} from '../../assets/scripts/world/GridCollision.ts';

const EPSILON = 0.01;

function createMap(
  width: number,
  height: number,
  blockedTiles: ReadonlySet<string>,
): TileCollisionMap {
  return {
    width,
    height,
    tileWidth: 32,
    tileHeight: 32,
    origin: {
      x: -(width * 32) / 2,
      y: -(height * 32) / 2,
    },
    isBlocked(tileX, tileY) {
      return blockedTiles.has(`${tileX},${tileY}`);
    },
  };
}

function assertApproximately(actual: number, expected: number): void {
  assert.ok(
    Math.abs(actual - expected) <= EPSILON,
    `Expected ${actual} to be approximately ${expected}`,
  );
}

test('treats positions outside the finite map as blocked', () => {
  const map = createMap(3, 3, new Set());
  const result = resolveGridMovement(
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { halfWidth: 4, halfHeight: 4 },
    map,
  );

  assertApproximately(result.position.x, 44);
  assert.equal(result.position.y, 0);
  assert.equal(result.collidedX, true);
  assert.equal(result.collidedY, false);
});

test('stops at an occupied tile without entering it', () => {
  const map = createMap(4, 3, new Set(['2,1']));
  const result = resolveGridMovement(
    { x: -16, y: 0 },
    { x: 40, y: 0 },
    { halfWidth: 4, halfHeight: 4 },
    map,
  );

  assertApproximately(result.position.x, -4);
  assert.equal(result.position.y, 0);
  assert.equal(result.collidedX, true);
});

test('slides along a wall when diagonal movement blocks only one axis', () => {
  const wall = new Set(['2,0', '2,1', '2,2', '2,3']);
  const map = createMap(4, 4, wall);
  const result = resolveGridMovement(
    { x: -16, y: -16 },
    { x: 40, y: 32 },
    { halfWidth: 4, halfHeight: 4 },
    map,
  );

  assertApproximately(result.position.x, -4);
  assertApproximately(result.position.y, 16);
  assert.equal(result.collidedX, true);
  assert.equal(result.collidedY, false);
});

test('uses swept substeps so a large frame cannot tunnel through a wall', () => {
  const map = createMap(8, 3, new Set(['4,1']));
  const result = resolveGridMovement(
    { x: -112, y: 0 },
    { x: 240, y: 0 },
    { halfWidth: 4, halfHeight: 4 },
    map,
  );

  assertApproximately(result.position.x, -4);
  assert.equal(result.collidedX, true);
});

test('converts the collision grid bottom row to Tiled top-down rows', () => {
  assert.equal(convertBottomTileYToTiledRow(0, 30), 29);
  assert.equal(convertBottomTileYToTiledRow(15, 30), 14);
  assert.equal(convertBottomTileYToTiledRow(29, 30), 0);
});
