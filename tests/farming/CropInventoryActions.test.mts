import assert from 'node:assert/strict';
import test from 'node:test';
import type {
  CropDefinition,
  ItemDefinition,
} from '../../assets/scripts/data/GameDataTypes.ts';
import type { FarmState } from '../../assets/scripts/farming/FarmState.ts';
import type { InventoryState } from '../../assets/scripts/inventory/InventoryState.ts';
import { registerProjectTypeScriptResolver } from '../support/registerProjectTypeScriptResolver.mts';

registerProjectTypeScriptResolver();

const { useCropInventoryAction } = await import(
  '../../assets/scripts/farming/CropInventoryActions.ts'
);

const MISTLEAF: CropDefinition = {
  id: 'mistleaf',
  seedItemId: 'mistleaf_seed',
  harvestItemId: 'mistleaf',
  growthStages: [1, 1, 1],
  harvestQuantity: 1,
  requiresWater: true,
  allowedSeasons: ['all'],
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
    id: 'watering_can_basic',
    displayNameKey: 'tool.watering_can_basic.name',
    type: 'tool',
    maxStack: 1,
    buyPrice: 0,
    sellPrice: 0,
    toolId: 'watering_can_basic',
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
  {
    id: 'mistleaf',
    displayNameKey: 'item.mistleaf.name',
    type: 'crop',
    maxStack: 99,
    buyPrice: 0,
    sellPrice: 30,
  },
];

function farmWithCrop(growthProgress: number | null): FarmState {
  return {
    mapId: 'mvp_farm',
    tiles: [{
      x: 4,
      y: 5,
      isTilled: true,
      wateredOnDay: 3,
      crop: growthProgress === null ? null : {
        cropId: 'mistleaf',
        plantedOnDay: 1,
        growthProgress,
        stageIndex: Math.min(growthProgress, 2),
        lastGrowthDay: growthProgress,
      },
    }],
  };
}

function startingInventory(seedQuantity = 3): InventoryState {
  return {
    slots: [
      { itemId: 'hoe_basic', quantity: 1 },
      { itemId: 'watering_can_basic', quantity: 1 },
      seedQuantity === 0
        ? null
        : { itemId: 'mistleaf_seed', quantity: seedQuantity },
      null,
    ],
    selectedSlotIndex: 0,
  };
}

test('plants empty tilled soil by consuming one seed from the real inventory', () => {
  const source = {
    farm: farmWithCrop(null),
    inventory: startingInventory(),
  };
  const result = useCropInventoryAction(
    source,
    { x: 4, y: 5 },
    'mistleaf_seed',
    4,
    [MISTLEAF],
    ITEMS,
  );

  assert.equal(result.status, 'planted');
  assert.deepEqual(result.consumedItem, { itemId: 'mistleaf_seed', quantity: 1 });
  assert.equal(result.state.farm.tiles[0]?.crop?.cropId, 'mistleaf');
  assert.deepEqual(result.state.inventory.slots[2], {
    itemId: 'mistleaf_seed',
    quantity: 2,
  });
  assert.equal(source.farm.tiles[0]?.crop, null);
  assert.deepEqual(source.inventory.slots[2], {
    itemId: 'mistleaf_seed',
    quantity: 3,
  });
});

test('harvests a mature crop into the same authoritative inventory', () => {
  const source = {
    farm: farmWithCrop(3),
    inventory: startingInventory(),
  };
  const result = useCropInventoryAction(
    source,
    { x: 4, y: 5 },
    'mistleaf_seed',
    4,
    [MISTLEAF],
    ITEMS,
  );

  assert.equal(result.status, 'harvested');
  assert.deepEqual(result.harvestedItem, { itemId: 'mistleaf', quantity: 1 });
  assert.equal(result.state.farm.tiles[0]?.crop, null);
  assert.deepEqual(result.state.inventory.slots[3], {
    itemId: 'mistleaf',
    quantity: 1,
  });
  assert.notEqual(result.state.farm, source.farm);
  assert.notEqual(result.state.inventory, source.inventory);
});

test('keeps both states unchanged for immature crops and missing seeds', () => {
  const immature = {
    farm: farmWithCrop(2),
    inventory: startingInventory(),
  };
  const emptyInventory = {
    farm: farmWithCrop(null),
    inventory: startingInventory(0),
  };

  const immatureResult = useCropInventoryAction(
    immature,
    { x: 4, y: 5 },
    'mistleaf_seed',
    4,
    [MISTLEAF],
    ITEMS,
  );
  const noSeedResult = useCropInventoryAction(
    emptyInventory,
    { x: 4, y: 5 },
    'mistleaf_seed',
    4,
    [MISTLEAF],
    ITEMS,
  );

  assert.equal(immatureResult.status, 'not_mature');
  assert.equal(immatureResult.state, immature);
  assert.equal(noSeedResult.status, 'no_seed');
  assert.equal(noSeedResult.state, emptyInventory);
});

test('requires a selected seed only when planting empty soil', () => {
  const emptySoil = {
    farm: farmWithCrop(null),
    inventory: startingInventory(),
  };
  const matureCrop = {
    farm: farmWithCrop(3),
    inventory: startingInventory(),
  };

  const rejectedPlanting = useCropInventoryAction(
    emptySoil,
    { x: 4, y: 5 },
    null,
    4,
    [MISTLEAF],
    ITEMS,
  );
  const harvestedWithoutSeed = useCropInventoryAction(
    matureCrop,
    { x: 4, y: 5 },
    null,
    4,
    [MISTLEAF],
    ITEMS,
  );

  assert.equal(rejectedPlanting.status, 'wrong_item');
  assert.equal(rejectedPlanting.state, emptySoil);
  assert.equal(harvestedWithoutSeed.status, 'harvested');
  assert.equal(harvestedWithoutSeed.state.farm.tiles[0]?.crop, null);
});

test('does not remove a mature crop when the complete yield cannot fit', () => {
  const fullInventory: InventoryState = {
    slots: [
      { itemId: 'hoe_basic', quantity: 1 },
      { itemId: 'watering_can_basic', quantity: 1 },
      { itemId: 'mistleaf_seed', quantity: 99 },
    ],
    selectedSlotIndex: 0,
  };
  const source = {
    farm: farmWithCrop(3),
    inventory: fullInventory,
  };
  const result = useCropInventoryAction(
    source,
    { x: 4, y: 5 },
    'mistleaf_seed',
    4,
    [MISTLEAF],
    ITEMS,
  );

  assert.equal(result.status, 'inventory_full');
  assert.equal(result.state, source);
  assert.equal(result.state.farm.tiles[0]?.crop?.cropId, 'mistleaf');
});
