import assert from 'node:assert/strict';
import test from 'node:test';
import type { FarmState } from '../../assets/scripts/farming/FarmState.ts';
import {
  createFarmableGroundPatches,
  createTilledSoilPatches,
} from '../../assets/scripts/farming/TilledSoilProjection.ts';

const GRID = {
  width: 30,
  height: 30,
  tileWidth: 32,
  tileHeight: 32,
  origin: { x: -480, y: -480 },
} as const;

test('projects every tile in the inclusive configured farmable rectangle', () => {
  assert.deepEqual(
    createFarmableGroundPatches(
      { min: { x: 5, y: 6 }, max: { x: 6, y: 7 } },
      GRID,
    ),
    [
      { tileX: 5, tileY: 6, left: -320, bottom: -288, width: 32, height: 32 },
      { tileX: 6, tileY: 6, left: -288, bottom: -288, width: 32, height: 32 },
      { tileX: 5, tileY: 7, left: -320, bottom: -256, width: 32, height: 32 },
      { tileX: 6, tileY: 7, left: -288, bottom: -256, width: 32, height: 32 },
    ],
  );
});

test('clips configured farmable visuals to the finite map', () => {
  const smallGrid = { ...GRID, width: 2, height: 2, origin: { x: 0, y: 0 } };

  assert.deepEqual(
    createFarmableGroundPatches(
      { min: { x: -2, y: 1 }, max: { x: 3, y: 4 } },
      smallGrid,
    ),
    [
      { tileX: 0, tileY: 1, left: 0, bottom: 32, width: 32, height: 32 },
      { tileX: 1, tileY: 1, left: 32, bottom: 32, width: 32, height: 32 },
    ],
  );
});

test('projects tilled state into map-local tile rectangles', () => {
  const farm: FarmState = {
    mapId: 'mvp_farm',
    tiles: [
      {
        x: 5,
        y: 6,
        isTilled: true,
        wateredOnDay: null,
        crop: null,
      },
      {
        x: 14,
        y: 14,
        isTilled: true,
        wateredOnDay: null,
        crop: null,
      },
    ],
  };

  assert.deepEqual(createTilledSoilPatches(farm, GRID), [
    {
      tileX: 5,
      tileY: 6,
      left: -320,
      bottom: -288,
      width: 32,
      height: 32,
    },
    {
      tileX: 14,
      tileY: 14,
      left: -32,
      bottom: -32,
      width: 32,
      height: 32,
    },
  ]);
});

test('skips persisted tiles that cannot be projected inside the current map', () => {
  const farm: FarmState = {
    mapId: 'mvp_farm',
    tiles: [
      {
        x: 30,
        y: 4,
        isTilled: true,
        wateredOnDay: null,
        crop: null,
      },
    ],
  };

  assert.deepEqual(createTilledSoilPatches(farm, GRID), []);
});
