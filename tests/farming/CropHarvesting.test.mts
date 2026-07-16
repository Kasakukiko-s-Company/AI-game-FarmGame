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

const { harvestCrop } = await import(
  '../../assets/scripts/farming/CropHarvesting.ts'
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
    id: 'mistleaf',
    displayNameKey: 'item.mistleaf.name',
    type: 'crop',
    maxStack: 99,
    buyPrice: 0,
    sellPrice: 30,
  },
];

function createFarm(
  growthProgress: number,
  cropId = MISTLEAF.id,
): FarmState {
  return {
    mapId: 'mvp_farm',
    tiles: [
      {
        x: 6,
        y: 7,
        isTilled: true,
        wateredOnDay: 3,
        crop: {
          cropId,
          plantedOnDay: 1,
          growthProgress,
          stageIndex: 2,
          lastGrowthDay: 3,
        },
      },
    ],
  };
}

function createInventory(
  slots: InventoryState['slots'] = [null, null],
): InventoryState {
  return { slots, selectedSlotIndex: 0 };
}

test('harvests a mature crop into inventory without mutating either source', () => {
  const source = {
    farm: createFarm(3),
    inventory: createInventory(),
  };
  const result = harvestCrop(source, { x: 6, y: 7 }, [MISTLEAF], ITEMS);

  assert.deepEqual(result, {
    status: 'harvested',
    state: {
      farm: {
        mapId: 'mvp_farm',
        tiles: [
          {
            x: 6,
            y: 7,
            isTilled: true,
            wateredOnDay: 3,
            crop: null,
          },
        ],
      },
      inventory: {
        slots: [{ itemId: 'mistleaf', quantity: 1 }, null],
        selectedSlotIndex: 0,
      },
    },
    harvestedItem: { itemId: 'mistleaf', quantity: 1 },
  });
  assert.notEqual(result.state, source);
  assert.notEqual(result.state.farm, source.farm);
  assert.notEqual(result.state.inventory, source.inventory);
  assert.equal(source.farm.tiles[0]?.crop?.cropId, 'mistleaf');
  assert.deepEqual(source.inventory.slots, [null, null]);
});

test('adds configured harvest quantity to an existing item stack', () => {
  const doubleYield: CropDefinition = {
    ...MISTLEAF,
    harvestQuantity: 2,
  };
  const source = {
    farm: createFarm(3),
    inventory: createInventory([
      { itemId: 'mistleaf', quantity: 97 },
      null,
    ]),
  };
  const result = harvestCrop(source, { x: 6, y: 7 }, [doubleYield], ITEMS);

  assert.equal(result.status, 'harvested');
  assert.deepEqual(result.harvestedItem, { itemId: 'mistleaf', quantity: 2 });
  assert.deepEqual(result.state.inventory.slots, [
    { itemId: 'mistleaf', quantity: 99 },
    null,
  ]);
});

test('keeps an immature crop and inventory unchanged', () => {
  const source = {
    farm: createFarm(2),
    inventory: createInventory(),
  };
  const result = harvestCrop(source, { x: 6, y: 7 }, [MISTLEAF], ITEMS);

  assert.equal(result.status, 'not_mature');
  assert.equal(result.state, source);
  assert.equal(result.harvestedItem, null);
});

test('distinguishes missing tilled tiles from empty tilled soil', () => {
  const planted = createFarm(3);
  const empty: FarmState = {
    ...planted,
    tiles: planted.tiles.map((tile) => ({ ...tile, crop: null })),
  };
  const inventory = createInventory();
  const missing = harvestCrop(
    { farm: planted, inventory },
    { x: 9, y: 9 },
    [MISTLEAF],
    ITEMS,
  );
  const noTarget = harvestCrop(
    { farm: planted, inventory },
    null,
    [MISTLEAF],
    ITEMS,
  );
  const noCropState = { farm: empty, inventory };
  const noCrop = harvestCrop(
    noCropState,
    { x: 6, y: 7 },
    [MISTLEAF],
    ITEMS,
  );

  assert.deepEqual(
    [missing.status, noTarget.status, noCrop.status],
    ['not_tilled', 'not_tilled', 'no_crop'],
  );
  assert.equal(noCrop.state, noCropState);
});

test('does not partially harvest when only part of the yield fits', () => {
  const doubleYield: CropDefinition = {
    ...MISTLEAF,
    harvestQuantity: 2,
  };
  const source = {
    farm: createFarm(3),
    inventory: createInventory([
      { itemId: 'mistleaf', quantity: 98 },
    ]),
  };
  const result = harvestCrop(source, { x: 6, y: 7 }, [doubleYield], ITEMS);

  assert.equal(result.status, 'inventory_full');
  assert.equal(result.state, source);
  assert.equal(result.harvestedItem, null);
  assert.equal(source.farm.tiles[0]?.crop?.cropId, 'mistleaf');
  assert.deepEqual(source.inventory.slots, [
    { itemId: 'mistleaf', quantity: 98 },
  ]);
});

test('rejects unknown crops and harvest items without changing state', () => {
  const unknownCropState = {
    farm: createFarm(3, 'missing_crop'),
    inventory: createInventory(),
  };
  const invalidItemState = {
    farm: createFarm(3),
    inventory: createInventory(),
  };
  const unknownCrop = harvestCrop(
    unknownCropState,
    { x: 6, y: 7 },
    [MISTLEAF],
    ITEMS,
  );
  const invalidItem = harvestCrop(
    invalidItemState,
    { x: 6, y: 7 },
    [{ ...MISTLEAF, harvestItemId: 'missing_item' }],
    ITEMS,
  );

  assert.equal(unknownCrop.status, 'invalid_crop');
  assert.equal(unknownCrop.state, unknownCropState);
  assert.equal(invalidItem.status, 'invalid_item');
  assert.equal(invalidItem.state, invalidItemState);
});

test('throws for corrupt growth progress and configured harvest quantity', () => {
  const inventory = createInventory();
  assert.throws(
    () => harvestCrop(
      { farm: createFarm(-1), inventory },
      { x: 6, y: 7 },
      [MISTLEAF],
      ITEMS,
    ),
    /growthProgress must be a non-negative integer/,
  );
  assert.throws(
    () => harvestCrop(
      { farm: createFarm(3), inventory },
      { x: 6, y: 7 },
      [{ ...MISTLEAF, harvestQuantity: 0 }],
      ITEMS,
    ),
    /quantity to add must be a positive integer/,
  );
});
