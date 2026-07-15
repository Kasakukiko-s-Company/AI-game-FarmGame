import assert from 'node:assert/strict';
import test from 'node:test';
import type { FarmState } from '../../assets/scripts/farming/FarmState.ts';
import { createCropPatches } from '../../assets/scripts/farming/CropProjection.ts';

const GRID = {
  width: 30,
  height: 30,
  tileWidth: 32,
  tileHeight: 32,
  origin: { x: -480, y: -480 },
} as const;

test('projects planted crops into map-local render patches', () => {
  const farm: FarmState = {
    mapId: 'mvp_farm',
    tiles: [
      {
        x: 6,
        y: 7,
        isTilled: true,
        wateredOnDay: null,
        crop: {
          cropId: 'mistleaf',
          plantedOnDay: 1,
          growthProgress: 0,
          stageIndex: 0,
          lastGrowthDay: 0,
        },
      },
      {
        x: 8,
        y: 9,
        isTilled: true,
        wateredOnDay: null,
        crop: null,
      },
    ],
  };

  assert.deepEqual(createCropPatches(farm, GRID), [
    {
      tileX: 6,
      tileY: 7,
      centerX: -272,
      bottom: -256,
      width: 32,
      height: 32,
      cropId: 'mistleaf',
      stageIndex: 0,
    },
  ]);
});

test('preserves configured crop identity and later visual stage indexes', () => {
  const farm: FarmState = {
    mapId: 'mvp_farm',
    tiles: [
      {
        x: 14,
        y: 14,
        isTilled: true,
        wateredOnDay: 3,
        crop: {
          cropId: 'mistleaf',
          plantedOnDay: 1,
          growthProgress: 2,
          stageIndex: 2,
          lastGrowthDay: 3,
        },
      },
    ],
  };

  assert.deepEqual(createCropPatches(farm, GRID), [
    {
      tileX: 14,
      tileY: 14,
      centerX: -16,
      bottom: -32,
      width: 32,
      height: 32,
      cropId: 'mistleaf',
      stageIndex: 2,
    },
  ]);
});

test('skips empty, malformed, and out-of-map persisted crop entries', () => {
  const farm: FarmState = {
    mapId: 'mvp_farm',
    tiles: [
      {
        x: 1,
        y: 1,
        isTilled: true,
        wateredOnDay: null,
        crop: null,
      },
      {
        x: 30,
        y: 2,
        isTilled: true,
        wateredOnDay: null,
        crop: {
          cropId: 'mistleaf',
          plantedOnDay: 1,
          growthProgress: 0,
          stageIndex: 0,
          lastGrowthDay: 0,
        },
      },
      {
        x: 2,
        y: 2,
        isTilled: true,
        wateredOnDay: null,
        crop: {
          cropId: '',
          plantedOnDay: 1,
          growthProgress: 0,
          stageIndex: 0,
          lastGrowthDay: 0,
        },
      },
      {
        x: 3,
        y: 3,
        isTilled: true,
        wateredOnDay: null,
        crop: {
          cropId: 'mistleaf',
          plantedOnDay: 1,
          growthProgress: 0,
          stageIndex: -1,
          lastGrowthDay: 0,
        },
      },
    ],
  };

  assert.deepEqual(createCropPatches(farm, GRID), []);
});
