import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getFacingTile,
  tileToWorldCenter,
  worldToTile,
  type TileGridGeometry,
} from '../../assets/scripts/world/TileInteraction.ts';

const GRID: TileGridGeometry = {
  width: 3,
  height: 2,
  tileWidth: 32,
  tileHeight: 32,
  origin: { x: -48, y: -32 },
};

test('maps world positions to bottom-left tiles without clamping map boundaries', () => {
  assert.deepEqual(
    [
      worldToTile({ x: -47.999, y: -31.999 }, GRID),
      worldToTile({ x: 0, y: 0 }, GRID),
      worldToTile({ x: 47.999, y: 31.999 }, GRID),
      worldToTile({ x: -48.001, y: 0 }, GRID),
      worldToTile({ x: 48, y: 0 }, GRID),
    ],
    [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      null,
      null,
    ],
  );
});

test('selects exactly one adjacent tile in the player facing direction', () => {
  const facingGrid: TileGridGeometry = {
    width: 3,
    height: 3,
    tileWidth: 32,
    tileHeight: 32,
    origin: { x: -48, y: -48 },
  };

  assert.deepEqual(
    [
      getFacingTile({ x: 0, y: 0 }, 'up', facingGrid),
      getFacingTile({ x: 0, y: 0 }, 'right', facingGrid),
      getFacingTile({ x: 0, y: 0 }, 'down', facingGrid),
      getFacingTile({ x: 0, y: 0 }, 'left', facingGrid),
      getFacingTile({ x: -32, y: 0 }, 'left', facingGrid),
      getFacingTile({ x: 48, y: 0 }, 'left', facingGrid),
    ],
    [
      { x: 1, y: 2 },
      { x: 2, y: 1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      null,
      null,
    ],
  );
});

test('returns world centers only for integer tiles inside the finite map', () => {
  assert.deepEqual(
    [
      tileToWorldCenter({ x: 0, y: 0 }, GRID),
      tileToWorldCenter({ x: 1, y: 1 }, GRID),
      tileToWorldCenter({ x: 2, y: 1 }, GRID),
      tileToWorldCenter({ x: -1, y: 0 }, GRID),
      tileToWorldCenter({ x: 3, y: 1 }, GRID),
      tileToWorldCenter({ x: 1.5, y: 0 }, GRID),
    ],
    [
      { x: -32, y: -16 },
      { x: 0, y: 16 },
      { x: 32, y: 16 },
      null,
      null,
      null,
    ],
  );
});
