import assert from 'node:assert/strict';
import test from 'node:test';
import {
  advanceFarmDay,
  sleepAtTile,
  waterTile,
  type FarmDayState,
} from '../../assets/scripts/farming/FarmDayCycle.ts';
import type { CropDefinition } from '../../assets/scripts/data/GameDataTypes.ts';

const MISTLEAF: CropDefinition = {
  id: 'mistleaf',
  seedItemId: 'mistleaf_seed',
  harvestItemId: 'mistleaf',
  growthStages: [1, 1, 1],
  harvestQuantity: 1,
  requiresWater: true,
  allowedSeasons: ['all'],
};

const SELF_WATERING_CROP: CropDefinition = {
  ...MISTLEAF,
  id: 'cloudmoss',
  seedItemId: 'cloudmoss_seed',
  harvestItemId: 'cloudmoss',
  requiresWater: false,
};

const DAY_ONE_FARM: FarmDayState = {
  currentDay: 1,
  farm: {
    mapId: 'mvp_farm',
    tiles: [
      {
        x: 6,
        y: 7,
        isTilled: true,
        wateredOnDay: null,
        crop: null,
      },
    ],
  },
};

test('waters one tilled tile for the current day without mutating the source state', () => {
  const result = waterTile(DAY_ONE_FARM, { x: 6, y: 7 });

  assert.deepEqual(
    { result, source: DAY_ONE_FARM },
    {
      result: {
        status: 'watered',
        state: {
          currentDay: 1,
          farm: {
            mapId: 'mvp_farm',
            tiles: [
              {
                x: 6,
                y: 7,
                isTilled: true,
                wateredOnDay: 1,
                crop: null,
              },
            ],
          },
        },
      },
      source: {
        currentDay: 1,
        farm: {
          mapId: 'mvp_farm',
          tiles: [
            {
              x: 6,
              y: 7,
              isTilled: true,
              wateredOnDay: null,
              crop: null,
            },
          ],
        },
      },
    },
  );
});

test('keeps the state unchanged for repeated watering and untilled targets', () => {
  const watered = waterTile(DAY_ONE_FARM, { x: 6, y: 7 });
  const repeated = waterTile(watered.state, { x: 6, y: 7 });
  const missing = waterTile(watered.state, { x: 8, y: 9 });
  const noTarget = waterTile(watered.state, null);

  assert.deepEqual(
    {
      statuses: [repeated.status, missing.status, noTarget.status],
      statesReuseWateredResult: [
        repeated.state === watered.state,
        missing.state === watered.state,
        noTarget.state === watered.state,
      ],
    },
    {
      statuses: ['already_watered', 'not_tilled', 'not_tilled'],
      statesReuseWateredResult: [true, true, true],
    },
  );
});

test('advances one day while only a watered required-water crop grows', () => {
  const source: FarmDayState = {
    currentDay: 1,
    farm: {
      mapId: 'mvp_farm',
      tiles: [
        {
          x: 5,
          y: 5,
          isTilled: true,
          wateredOnDay: 1,
          crop: {
            cropId: 'mistleaf',
            plantedOnDay: 1,
            growthProgress: 0,
            stageIndex: 0,
            lastGrowthDay: 0,
          },
        },
        {
          x: 6,
          y: 5,
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
      ],
    },
  };

  const result = advanceFarmDay(source, [MISTLEAF]);

  assert.deepEqual(
    { result, source },
    {
      result: {
        status: 'advanced',
        state: {
          currentDay: 2,
          farm: {
            mapId: 'mvp_farm',
            tiles: [
              {
                x: 5,
                y: 5,
                isTilled: true,
                wateredOnDay: 1,
                crop: {
                  cropId: 'mistleaf',
                  plantedOnDay: 1,
                  growthProgress: 1,
                  stageIndex: 1,
                  lastGrowthDay: 1,
                },
              },
              {
                x: 6,
                y: 5,
                isTilled: true,
                wateredOnDay: null,
                crop: {
                  cropId: 'mistleaf',
                  plantedOnDay: 1,
                  growthProgress: 0,
                  stageIndex: 0,
                  lastGrowthDay: 1,
                },
              },
            ],
          },
        },
      },
      source: {
        currentDay: 1,
        farm: {
          mapId: 'mvp_farm',
          tiles: [
            {
              x: 5,
              y: 5,
              isTilled: true,
              wateredOnDay: 1,
              crop: {
                cropId: 'mistleaf',
                plantedOnDay: 1,
                growthProgress: 0,
                stageIndex: 0,
                lastGrowthDay: 0,
              },
            },
            {
              x: 6,
              y: 5,
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
          ],
        },
      },
    },
  );
});

test('keeps a mature crop at its configured maximum while settling the day', () => {
  const source: FarmDayState = {
    currentDay: 4,
    farm: {
      mapId: 'mvp_farm',
      tiles: [
        {
          x: 7,
          y: 8,
          isTilled: true,
          wateredOnDay: 4,
          crop: {
            cropId: 'mistleaf',
            plantedOnDay: 1,
            growthProgress: 3,
            stageIndex: 2,
            lastGrowthDay: 3,
          },
        },
      ],
    },
  };

  const result = advanceFarmDay(source, [MISTLEAF]);

  assert.deepEqual(
    {
      status: result.status,
      currentDay: result.state.currentDay,
      crop: result.state.farm.tiles[0]?.crop,
    },
    {
      status: 'advanced',
      currentDay: 5,
      crop: {
        cropId: 'mistleaf',
        plantedOnDay: 1,
        growthProgress: 3,
        stageIndex: 2,
        lastGrowthDay: 4,
      },
    },
  );
});

test('grows a crop that does not require water according to its configuration', () => {
  const source: FarmDayState = {
    currentDay: 1,
    farm: {
      mapId: 'mvp_farm',
      tiles: [
        {
          x: 8,
          y: 8,
          isTilled: true,
          wateredOnDay: null,
          crop: {
            cropId: 'cloudmoss',
            plantedOnDay: 1,
            growthProgress: 0,
            stageIndex: 0,
            lastGrowthDay: 0,
          },
        },
      ],
    },
  };

  const result = advanceFarmDay(source, [SELF_WATERING_CROP]);

  assert.deepEqual(
    {
      currentDay: result.state.currentDay,
      crop: result.state.farm.tiles[0]?.crop,
    },
    {
      currentDay: 2,
      crop: {
        cropId: 'cloudmoss',
        plantedOnDay: 1,
        growthProgress: 1,
        stageIndex: 1,
        lastGrowthDay: 1,
      },
    },
  );
});

test('does not settle the same crop twice for one day', () => {
  const source: FarmDayState = {
    currentDay: 2,
    farm: {
      mapId: 'mvp_farm',
      tiles: [
        {
          x: 9,
          y: 8,
          isTilled: true,
          wateredOnDay: 2,
          crop: {
            cropId: 'mistleaf',
            plantedOnDay: 1,
            growthProgress: 1,
            stageIndex: 1,
            lastGrowthDay: 2,
          },
        },
      ],
    },
  };

  const result = advanceFarmDay(source, [MISTLEAF]);

  assert.deepEqual(
    {
      currentDay: result.state.currentDay,
      crop: result.state.farm.tiles[0]?.crop,
    },
    {
      currentDay: 3,
      crop: {
        cropId: 'mistleaf',
        plantedOnDay: 1,
        growthProgress: 1,
        stageIndex: 1,
        lastGrowthDay: 2,
      },
    },
  );
});

test('rejects an unknown persisted crop without partially advancing the day', () => {
  const source: FarmDayState = {
    currentDay: 1,
    farm: {
      mapId: 'mvp_farm',
      tiles: [
        {
          x: 10,
          y: 8,
          isTilled: true,
          wateredOnDay: 1,
          crop: {
            cropId: 'mistleaf',
            plantedOnDay: 1,
            growthProgress: 0,
            stageIndex: 0,
            lastGrowthDay: 0,
          },
        },
        {
          x: 11,
          y: 8,
          isTilled: true,
          wateredOnDay: 1,
          crop: {
            cropId: 'missing_crop',
            plantedOnDay: 1,
            growthProgress: 0,
            stageIndex: 0,
            lastGrowthDay: 0,
          },
        },
      ],
    },
  };

  const result = advanceFarmDay(source, [MISTLEAF]);

  assert.deepEqual(
    {
      status: result.status,
      reusesSource: result.state === source,
      state: result.state,
    },
    {
      status: 'invalid_crop',
      reusesSource: true,
      state: source,
    },
  );
});

test('rejects invalid day counters at both public rule entry points', () => {
  const invalidStates: ReadonlyArray<FarmDayState> = [
    { ...DAY_ONE_FARM, currentDay: 0 },
    { ...DAY_ONE_FARM, currentDay: 1.5 },
  ];

  for (const state of invalidStates) {
    assert.throws(
      () => waterTile(state, { x: 6, y: 7 }),
      { name: 'RangeError', message: 'currentDay must be a positive integer' },
    );
    assert.throws(
      () => advanceFarmDay(state, [MISTLEAF]),
      { name: 'RangeError', message: 'currentDay must be a positive integer' },
    );
  }
});

test('sleeps only when the interaction target matches the configured sleep tile', () => {
  const wrongTile = sleepAtTile(
    DAY_ONE_FARM,
    { x: 14, y: 22 },
    { x: 15, y: 22 },
    [MISTLEAF],
  );
  const noTarget = sleepAtTile(
    DAY_ONE_FARM,
    null,
    { x: 15, y: 22 },
    [MISTLEAF],
  );

  assert.deepEqual(
    {
      statuses: [wrongTile.status, noTarget.status],
      reusesSource: [
        wrongTile.state === DAY_ONE_FARM,
        noTarget.state === DAY_ONE_FARM,
      ],
    },
    {
      statuses: ['not_at_sleep_point', 'not_at_sleep_point'],
      reusesSource: [true, true],
    },
  );
});

test('sleeping at the configured point settles exactly one day', () => {
  const source: FarmDayState = {
    currentDay: 3,
    farm: {
      mapId: 'mvp_farm',
      tiles: [
        {
          x: 12,
          y: 13,
          isTilled: true,
          wateredOnDay: 3,
          crop: {
            cropId: 'mistleaf',
            plantedOnDay: 3,
            growthProgress: 0,
            stageIndex: 0,
            lastGrowthDay: 2,
          },
        },
      ],
    },
  };

  const result = sleepAtTile(
    source,
    { x: 15, y: 22 },
    { x: 15, y: 22 },
    [MISTLEAF],
  );

  assert.deepEqual(
    {
      status: result.status,
      currentDay: result.state.currentDay,
      crop: result.state.farm.tiles[0]?.crop,
      sourceDay: source.currentDay,
    },
    {
      status: 'slept',
      currentDay: 4,
      crop: {
        cropId: 'mistleaf',
        plantedOnDay: 3,
        growthProgress: 1,
        stageIndex: 1,
        lastGrowthDay: 3,
      },
      sourceDay: 3,
    },
  );
});

test('sleeping rejects unknown crop data without advancing any state', () => {
  const source: FarmDayState = {
    currentDay: 1,
    farm: {
      mapId: 'mvp_farm',
      tiles: [
        {
          x: 12,
          y: 13,
          isTilled: true,
          wateredOnDay: 1,
          crop: {
            cropId: 'missing_crop',
            plantedOnDay: 1,
            growthProgress: 0,
            stageIndex: 0,
            lastGrowthDay: 0,
          },
        },
      ],
    },
  };

  const result = sleepAtTile(
    source,
    { x: 15, y: 22 },
    { x: 15, y: 22 },
    [MISTLEAF],
  );

  assert.deepEqual(
    {
      status: result.status,
      reusesSource: result.state === source,
      currentDay: result.state.currentDay,
    },
    {
      status: 'invalid_crop',
      reusesSource: true,
      currentDay: 1,
    },
  );
});
