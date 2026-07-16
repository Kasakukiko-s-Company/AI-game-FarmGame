import assert from 'node:assert/strict';
import test from 'node:test';
import type {
  CropDefinition,
  ItemDefinition,
  MapDefinition,
} from '../../assets/scripts/data/GameDataTypes.ts';
import type { RuntimeSaveSource } from '../../assets/scripts/core/save/RuntimeSaveState.ts';
import type { SaveData } from '../../assets/scripts/core/save/SaveData.ts';
import { registerProjectTypeScriptResolver } from '../support/registerProjectTypeScriptResolver.mts';

registerProjectTypeScriptResolver();

const {
  captureRuntimeSave,
  prepareRuntimeRestore,
} = await import('../../assets/scripts/core/save/RuntimeSaveState.ts');

const MAP: MapDefinition = {
  id: 'mvp_farm',
  displayNameKey: 'map.mvp_farm.name',
  widthTiles: 30,
  heightTiles: 30,
  tileSizePixels: 32,
  spawnTile: { x: 15, y: 18 },
  sleepTile: { x: 15, y: 22 },
  farmableArea: {
    min: { x: 5, y: 5 },
    max: { x: 14, y: 14 },
  },
};

const ITEMS: ReadonlyArray<ItemDefinition> = [
  {
    id: 'hoe_basic',
    displayNameKey: 'tool.hoe_basic.name',
    type: 'tool',
    maxStack: 1,
    buyPrice: 0,
    sellPrice: 0,
    toolId: 'hoe_basic',
  },
  {
    id: 'mistleaf_seed',
    displayNameKey: 'item.mistleaf_seed.name',
    type: 'seed',
    maxStack: 99,
    buyPrice: 20,
    sellPrice: 10,
    cropId: 'mistleaf',
  },
];

const CROPS: ReadonlyArray<CropDefinition> = [{
  id: 'mistleaf',
  seedItemId: 'mistleaf_seed',
  harvestItemId: 'mistleaf',
  growthStages: [1, 1, 1],
  harvestQuantity: 1,
  requiresWater: true,
  allowedSeasons: ['all'],
}];

const VALIDATION = {
  maps: [MAP],
  items: ITEMS,
  crops: CROPS,
};

function runtimeSource(): RuntimeSaveSource {
  return {
    mapId: 'mvp_farm',
    playerWorldPosition: { x: 64.5, y: -32.25 },
    playerFacing: 'left',
    farmDay: {
      currentDay: 3,
      farm: {
        mapId: 'mvp_farm',
        tiles: [{
          x: 8,
          y: 9,
          isTilled: true,
          wateredOnDay: 3,
          crop: {
            cropId: 'mistleaf',
            plantedOnDay: 1,
            growthProgress: 2,
            stageIndex: 2,
            lastGrowthDay: 2,
          },
        }],
      },
    },
    inventory: {
      selectedSlotIndex: 1,
      slots: [
        { itemId: 'hoe_basic', quantity: 1 },
        { itemId: 'mistleaf_seed', quantity: 2 },
        null,
        null,
        null,
        null,
        null,
        null,
      ],
    },
  };
}

function capturedSave(): SaveData {
  const result = captureRuntimeSave(
    runtimeSource(),
    '2026-07-16T12:00:00.000Z',
    VALIDATION,
  );
  assert.equal(result.status, 'captured');
  if (result.status !== 'captured') {
    throw new Error(result.message);
  }
  return result.save;
}

test('captures all authoritative runtime state as one detached snapshot', () => {
  const source = runtimeSource();
  const result = captureRuntimeSave(
    source,
    '2026-07-16T12:00:00.000Z',
    VALIDATION,
  );

  assert.equal(result.status, 'captured');
  if (result.status !== 'captured') {
    return;
  }
  assert.deepEqual(result.save.player, {
    mapId: 'mvp_farm',
    worldPosition: { x: 64.5, y: -32.25 },
    facing: 'left',
  });
  assert.equal(result.save.currentDay, 3);
  assert.deepEqual(result.save.inventory, source.inventory);
  assert.deepEqual(result.save.farm, source.farmDay.farm);
  assert.notEqual(result.save.inventory, source.inventory);
  assert.notEqual(result.save.inventory.slots, source.inventory.slots);
  assert.notEqual(result.save.farm, source.farmDay.farm);
  assert.notEqual(result.save.farm.tiles, source.farmDay.farm.tiles);
});

test('rejects an internally inconsistent runtime snapshot', () => {
  const source = runtimeSource();
  const result = captureRuntimeSave(
    {
      ...source,
      farmDay: {
        ...source.farmDay,
        farm: { ...source.farmDay.farm, mapId: 'another_map' },
      },
    },
    '2026-07-16T12:00:00.000Z',
    VALIDATION,
  );

  assert.equal(result.status, 'invalid_runtime');
});

test('prepares a detached restore plan after complete validation', () => {
  const save = capturedSave();
  const result = prepareRuntimeRestore(save, 'mvp_farm', VALIDATION);

  assert.equal(result.status, 'ready');
  if (result.status !== 'ready') {
    return;
  }
  assert.deepEqual(result.plan.playerWorldPosition, { x: 64.5, y: -32.25 });
  assert.equal(result.plan.playerFacing, 'left');
  assert.equal(result.plan.farmDay.currentDay, 3);
  assert.deepEqual(result.plan.inventory, save.inventory);
  assert.deepEqual(result.plan.farmDay.farm, save.farm);
  assert.notEqual(result.plan.inventory, save.inventory);
  assert.notEqual(result.plan.farmDay.farm, save.farm);
});

test('rejects a valid save that targets another active map', () => {
  const result = prepareRuntimeRestore(
    capturedSave(),
    'another_map',
    {
      ...VALIDATION,
      maps: [
        MAP,
        { ...MAP, id: 'another_map' },
      ],
    },
  );

  assert.deepEqual(result, {
    status: 'map_mismatch',
    activeMapId: 'another_map',
    savedMapId: 'mvp_farm',
  });
});

test('rejects corrupt typed input before producing a restore plan', () => {
  const save = capturedSave();
  const result = prepareRuntimeRestore(
    {
      ...save,
      inventory: {
        ...save.inventory,
        selectedSlotIndex: 99,
      },
    },
    'mvp_farm',
    VALIDATION,
  );

  assert.equal(result.status, 'invalid_save');
});
