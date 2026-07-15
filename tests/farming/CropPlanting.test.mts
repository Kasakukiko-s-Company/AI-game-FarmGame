import assert from 'node:assert/strict';
import test from 'node:test';
import type { CropDefinition } from '../../assets/scripts/data/GameDataTypes.ts';
import {
  calculateCropGrowthStage,
  plantCrop,
  type SeedStack,
} from '../../assets/scripts/farming/CropPlanting.ts';
import type { FarmState } from '../../assets/scripts/farming/FarmState.ts';

const MISTLEAF: CropDefinition = {
  id: 'mistleaf',
  seedItemId: 'mistleaf_seed',
  harvestItemId: 'mistleaf',
  growthStages: [1, 1, 1],
  harvestQuantity: 1,
  requiresWater: true,
  allowedSeasons: ['all'],
};

const TILLED_FARM: FarmState = {
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
};

const SEEDS: SeedStack = {
  itemId: 'mistleaf_seed',
  quantity: 3,
};

test('plants configured crop and consumes exactly one seed without mutating inputs', () => {
  const result = plantCrop(
    TILLED_FARM,
    { x: 6, y: 7 },
    SEEDS,
    4,
    [MISTLEAF],
  );

  assert.deepEqual(result, {
    status: 'planted',
    farm: {
      mapId: 'mvp_farm',
      tiles: [
        {
          x: 6,
          y: 7,
          isTilled: true,
          wateredOnDay: null,
          crop: {
            cropId: 'mistleaf',
            plantedOnDay: 4,
            growthProgress: 0,
            stageIndex: 0,
            lastGrowthDay: 3,
          },
        },
      ],
    },
    seeds: {
      itemId: 'mistleaf_seed',
      quantity: 2,
    },
  });
  assert.deepEqual(TILLED_FARM.tiles[0]?.crop, null);
  assert.equal(SEEDS.quantity, 3);
});

test('rejects an empty seed stack without changing either source state', () => {
  const emptySeeds: SeedStack = { itemId: 'mistleaf_seed', quantity: 0 };
  const result = plantCrop(
    TILLED_FARM,
    { x: 6, y: 7 },
    emptySeeds,
    1,
    [MISTLEAF],
  );

  assert.equal(result.status, 'no_seed');
  assert.equal(result.farm, TILLED_FARM);
  assert.equal(result.seeds, emptySeeds);
});

test('rejects missing and untilled targets without consuming a seed', () => {
  const results = [
    plantCrop(TILLED_FARM, null, SEEDS, 1, [MISTLEAF]),
    plantCrop(TILLED_FARM, { x: 8, y: 9 }, SEEDS, 1, [MISTLEAF]),
  ];

  assert.deepEqual(results.map((result) => result.status), [
    'not_tilled',
    'not_tilled',
  ]);
  for (const result of results) {
    assert.equal(result.farm, TILLED_FARM);
    assert.equal(result.seeds, SEEDS);
  }
});

test('rejects an occupied tile without replacing its crop or consuming a seed', () => {
  const planted = plantCrop(TILLED_FARM, { x: 6, y: 7 }, SEEDS, 1, [MISTLEAF]);
  const repeated = plantCrop(
    planted.farm,
    { x: 6, y: 7 },
    planted.seeds,
    1,
    [MISTLEAF],
  );

  assert.equal(repeated.status, 'occupied');
  assert.equal(repeated.farm, planted.farm);
  assert.equal(repeated.seeds, planted.seeds);
});

test('rejects a seed item that has no matching JSON crop definition', () => {
  const unknownSeeds: SeedStack = { itemId: 'unknown_seed', quantity: 2 };
  const result = plantCrop(
    TILLED_FARM,
    { x: 6, y: 7 },
    unknownSeeds,
    1,
    [MISTLEAF],
  );

  assert.equal(result.status, 'invalid_seed');
  assert.equal(result.farm, TILLED_FARM);
  assert.equal(result.seeds, unknownSeeds);
});

test('calculates configured growth stages and maturity from cumulative days', () => {
  const stages = [2, 1, 2];

  assert.deepEqual(
    [0, 1, 2, 3, 4, 5, 9].map((progress) =>
      calculateCropGrowthStage(progress, stages)),
    [
      { stageIndex: 0, isMature: false },
      { stageIndex: 0, isMature: false },
      { stageIndex: 1, isMature: false },
      { stageIndex: 2, isMature: false },
      { stageIndex: 2, isMature: false },
      { stageIndex: 2, isMature: true },
      { stageIndex: 2, isMature: true },
    ],
  );
});

test('fails explicitly for invalid day, quantity, progress, or growth configuration', () => {
  assert.throws(
    () => plantCrop(TILLED_FARM, { x: 6, y: 7 }, SEEDS, 0, [MISTLEAF]),
    /currentDay must be a positive integer/,
  );
  assert.throws(
    () => plantCrop(
      TILLED_FARM,
      { x: 6, y: 7 },
      { itemId: 'mistleaf_seed', quantity: -1 },
      1,
      [MISTLEAF],
    ),
    /seed quantity must be a non-negative integer/,
  );
  assert.throws(
    () => calculateCropGrowthStage(-1, [1]),
    /growthProgress must be a non-negative integer/,
  );
  assert.throws(
    () => calculateCropGrowthStage(0, []),
    /growthStages must contain positive integers/,
  );
  assert.throws(
    () => calculateCropGrowthStage(0, [1, 0]),
    /growthStages must contain positive integers/,
  );
});
