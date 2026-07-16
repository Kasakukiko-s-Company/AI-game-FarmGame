import assert from 'node:assert/strict';
import test from 'node:test';
import type { ItemDefinition } from '../../assets/scripts/data/GameDataTypes.ts';
import type { InventoryState } from '../../assets/scripts/inventory/InventoryState.ts';
import { registerProjectTypeScriptResolver } from '../support/registerProjectTypeScriptResolver.mts';

registerProjectTypeScriptResolver();

const {
  createQuickbarProjection,
  RELEASED_QUICKBAR_SELECTION,
  resolveQuickbarItem,
  resolveSelectedQuickbarItem,
  updateQuickbarSelection,
} = await import('../../assets/scripts/inventory/Quickbar.ts');

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

function inventory(selectedSlotIndex = 0): InventoryState {
  return {
    slots: [
      { itemId: 'hoe_basic', quantity: 1 },
      { itemId: 'watering_can_basic', quantity: 1 },
      { itemId: 'mistleaf_seed', quantity: 3 },
      { itemId: 'mistleaf', quantity: 2 },
      null,
      null,
      null,
      null,
    ],
    selectedSlotIndex,
  };
}

test('projects all fixed slots and exactly one selected slot', () => {
  const projection = createQuickbarProjection(inventory(2));

  assert.equal(projection.length, 8);
  assert.equal(projection.filter((slot) => slot.isSelected).length, 1);
  assert.equal(projection[2]?.isSelected, true);
  assert.deepEqual(projection[3]?.stack, {
    itemId: 'mistleaf',
    quantity: 2,
  });
});

test('resolves selected tools, seed, crop and empty slots from item data', () => {
  assert.equal(
    resolveSelectedQuickbarItem(
      inventory(0),
      ITEMS,
      'hoe_basic',
      'watering_can_basic',
    ).use,
    'till',
  );
  assert.equal(
    resolveSelectedQuickbarItem(
      inventory(1),
      ITEMS,
      'hoe_basic',
      'watering_can_basic',
    ).use,
    'water',
  );
  assert.equal(
    resolveSelectedQuickbarItem(
      inventory(2),
      ITEMS,
      'hoe_basic',
      'watering_can_basic',
    ).use,
    'plant',
  );
  assert.equal(
    resolveSelectedQuickbarItem(
      inventory(3),
      ITEMS,
      'hoe_basic',
      'watering_can_basic',
    ).use,
    'carry',
  );
  assert.equal(
    resolveSelectedQuickbarItem(
      inventory(4),
      ITEMS,
      'hoe_basic',
      'watering_can_basic',
    ).use,
    'empty',
  );
  assert.equal(
    resolveQuickbarItem(
      { itemId: 'missing', quantity: 1 },
      ITEMS,
      'hoe_basic',
      'watering_can_basic',
    ).use,
    'carry',
  );
});

test('direct number selection is edge-triggered and accepts a changed held key', () => {
  const first = updateQuickbarSelection(
    inventory(),
    RELEASED_QUICKBAR_SELECTION,
    { directSlotIndex: 2, selectPrevious: false, selectNext: false },
  );
  const held = updateQuickbarSelection(
    first.inventory,
    first.latch,
    { directSlotIndex: 2, selectPrevious: false, selectNext: false },
  );
  const changed = updateQuickbarSelection(
    held.inventory,
    held.latch,
    { directSlotIndex: 1, selectPrevious: false, selectNext: false },
  );

  assert.equal(first.status, 'selected');
  assert.equal(first.inventory.selectedSlotIndex, 2);
  assert.equal(held.status, 'idle');
  assert.equal(held.inventory, first.inventory);
  assert.equal(changed.status, 'selected');
  assert.equal(changed.inventory.selectedSlotIndex, 1);
});

test('previous and next selection wrap and do not repeat while held', () => {
  const previous = updateQuickbarSelection(
    inventory(0),
    RELEASED_QUICKBAR_SELECTION,
    { directSlotIndex: null, selectPrevious: true, selectNext: false },
  );
  const held = updateQuickbarSelection(
    previous.inventory,
    previous.latch,
    { directSlotIndex: null, selectPrevious: true, selectNext: false },
  );
  const released = updateQuickbarSelection(
    held.inventory,
    held.latch,
    { directSlotIndex: null, selectPrevious: false, selectNext: false },
  );
  const next = updateQuickbarSelection(
    released.inventory,
    released.latch,
    { directSlotIndex: null, selectPrevious: false, selectNext: true },
  );

  assert.equal(previous.inventory.selectedSlotIndex, 7);
  assert.equal(held.status, 'idle');
  assert.equal(next.inventory.selectedSlotIndex, 0);
});

test('direct selection has priority and invalid slots leave inventory unchanged', () => {
  const source = inventory(0);
  const direct = updateQuickbarSelection(
    source,
    RELEASED_QUICKBAR_SELECTION,
    { directSlotIndex: 3, selectPrevious: true, selectNext: true },
  );
  const invalid = updateQuickbarSelection(
    direct.inventory,
    RELEASED_QUICKBAR_SELECTION,
    { directSlotIndex: 8, selectPrevious: false, selectNext: false },
  );

  assert.equal(direct.inventory.selectedSlotIndex, 3);
  assert.equal(invalid.status, 'invalid_slot');
  assert.equal(invalid.inventory, direct.inventory);
});
