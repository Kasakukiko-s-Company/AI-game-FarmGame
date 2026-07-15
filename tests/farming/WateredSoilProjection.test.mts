import assert from 'node:assert/strict';
import test from 'node:test';
import type { FarmDayState } from '../../assets/scripts/farming/FarmDayCycle.ts';
import { createWateredSoilPatches } from '../../assets/scripts/farming/WateredSoilProjection.ts';

const GRID = {
  width: 30,
  height: 30,
  tileWidth: 32,
  tileHeight: 32,
  origin: { x: -480, y: -480 },
} as const;

test('projects only soil watered on the current day', () => {
  const state: FarmDayState = {
    currentDay: 3,
    farm: {
      mapId: 'mvp_farm',
      tiles: [
        {
          x: 5,
          y: 6,
          isTilled: true,
          wateredOnDay: 3,
          crop: null,
        },
        {
          x: 6,
          y: 6,
          isTilled: true,
          wateredOnDay: 2,
          crop: null,
        },
        {
          x: 30,
          y: 6,
          isTilled: true,
          wateredOnDay: 3,
          crop: null,
        },
      ],
    },
  };

  assert.deepEqual(createWateredSoilPatches(state, GRID), [
    {
      tileX: 5,
      tileY: 6,
      left: -320,
      bottom: -288,
      width: 32,
      height: 32,
    },
  ]);
});

test('rejects an invalid display day even when a persisted marker matches it', () => {
  const state: FarmDayState = {
    currentDay: 0,
    farm: {
      mapId: 'mvp_farm',
      tiles: [
        {
          x: 5,
          y: 6,
          isTilled: true,
          wateredOnDay: 0,
          crop: null,
        },
      ],
    },
  };

  assert.deepEqual(createWateredSoilPatches(state, GRID), []);
});
