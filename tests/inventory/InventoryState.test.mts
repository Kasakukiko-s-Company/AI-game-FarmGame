import assert from 'node:assert/strict';
import test from 'node:test';
import type { ItemDefinition } from '../../assets/scripts/data/GameDataTypes.ts';
import {
  addInventoryItem,
  createInventory,
  getSelectedItemStack,
  removeInventoryItem,
  selectInventorySlot,
  type InventoryState,
} from '../../assets/scripts/inventory/InventoryState.ts';

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
  {
    id: 'mistleaf',
    displayNameKey: 'item.mistleaf.name',
    type: 'crop',
    maxStack: 99,
    buyPrice: 0,
    sellPrice: 30,
  },
];

function inventoryWithSlots(
  slots: InventoryState['slots'],
  selectedSlotIndex = 0,
): InventoryState {
  return { slots, selectedSlotIndex };
}

test('creates the eight-slot MVP inventory with a valid empty selection', () => {
  const inventory = createInventory();

  assert.equal(inventory.slots.length, 8);
  assert.deepEqual(inventory.slots, Array.from({ length: 8 }, () => null));
  assert.equal(inventory.selectedSlotIndex, 0);
  assert.equal(getSelectedItemStack(inventory), null);
});

test('fills an existing stack before splitting overflow into an empty slot', () => {
  const empty = createInventory(3);
  const first = addInventoryItem(
    empty,
    { itemId: 'mistleaf_seed', quantity: 60 },
    ITEMS,
  );
  const second = addInventoryItem(
    first.inventory,
    { itemId: 'mistleaf_seed', quantity: 50 },
    ITEMS,
  );

  assert.equal(first.status, 'added');
  assert.equal(second.status, 'added');
  assert.deepEqual(second.inventory.slots, [
    { itemId: 'mistleaf_seed', quantity: 99 },
    { itemId: 'mistleaf_seed', quantity: 11 },
    null,
  ]);
  assert.deepEqual(empty.slots, [null, null, null]);
  assert.deepEqual(first.inventory.slots, [
    { itemId: 'mistleaf_seed', quantity: 60 },
    null,
    null,
  ]);
});

test('respects tool maxStack one and places duplicates in separate slots', () => {
  const result = addInventoryItem(
    createInventory(2),
    { itemId: 'hoe_basic', quantity: 2 },
    ITEMS,
  );

  assert.deepEqual(result, {
    status: 'added',
    inventory: {
      slots: [
        { itemId: 'hoe_basic', quantity: 1 },
        { itemId: 'hoe_basic', quantity: 1 },
      ],
      selectedSlotIndex: 0,
    },
  });
});

test('keeps the original inventory unchanged when the whole addition cannot fit', () => {
  const source = inventoryWithSlots([
    { itemId: 'mistleaf_seed', quantity: 90 },
  ]);
  const result = addInventoryItem(
    source,
    { itemId: 'mistleaf_seed', quantity: 10 },
    ITEMS,
  );

  assert.equal(result.status, 'inventory_full');
  assert.equal(result.inventory, source);
  assert.deepEqual(source.slots, [{ itemId: 'mistleaf_seed', quantity: 90 }]);
});

test('removes an exact quantity from the lowest matching slots without mutation', () => {
  const source = inventoryWithSlots([
    { itemId: 'mistleaf_seed', quantity: 2 },
    { itemId: 'hoe_basic', quantity: 1 },
    { itemId: 'mistleaf_seed', quantity: 3 },
  ]);
  const result = removeInventoryItem(
    source,
    { itemId: 'mistleaf_seed', quantity: 4 },
    ITEMS,
  );

  assert.deepEqual(result, {
    status: 'removed',
    inventory: {
      slots: [
        null,
        { itemId: 'hoe_basic', quantity: 1 },
        { itemId: 'mistleaf_seed', quantity: 1 },
      ],
      selectedSlotIndex: 0,
    },
  });
  assert.deepEqual(source.slots, [
    { itemId: 'mistleaf_seed', quantity: 2 },
    { itemId: 'hoe_basic', quantity: 1 },
    { itemId: 'mistleaf_seed', quantity: 3 },
  ]);
});

test('does not partially remove an insufficient quantity', () => {
  const source = inventoryWithSlots([
    { itemId: 'mistleaf_seed', quantity: 2 },
    null,
  ]);
  const result = removeInventoryItem(
    source,
    { itemId: 'mistleaf_seed', quantity: 3 },
    ITEMS,
  );

  assert.equal(result.status, 'insufficient_item');
  assert.equal(result.inventory, source);
});

test('selects only valid quickbar slots and exposes the selected stack', () => {
  const source = inventoryWithSlots([
    { itemId: 'hoe_basic', quantity: 1 },
    { itemId: 'mistleaf_seed', quantity: 3 },
    null,
  ]);
  const selected = selectInventorySlot(source, 1);
  const repeated = selectInventorySlot(selected.inventory, 1);
  const invalid = selectInventorySlot(selected.inventory, 3);

  assert.equal(selected.status, 'selected');
  assert.deepEqual(getSelectedItemStack(selected.inventory), {
    itemId: 'mistleaf_seed',
    quantity: 3,
  });
  assert.equal(repeated.status, 'already_selected');
  assert.equal(repeated.inventory, selected.inventory);
  assert.equal(invalid.status, 'invalid_slot');
  assert.equal(invalid.inventory, selected.inventory);
  assert.equal(source.selectedSlotIndex, 0);
});

test('rejects unknown items without mutation and throws for corrupt counters', () => {
  const source = createInventory(2);
  const unknownAdd = addInventoryItem(
    source,
    { itemId: 'missing_item', quantity: 1 },
    ITEMS,
  );
  const unknownRemove = removeInventoryItem(
    source,
    { itemId: 'missing_item', quantity: 1 },
    ITEMS,
  );

  assert.equal(unknownAdd.status, 'invalid_item');
  assert.equal(unknownAdd.inventory, source);
  assert.equal(unknownRemove.status, 'invalid_item');
  assert.equal(unknownRemove.inventory, source);
  assert.throws(() => createInventory(0), /inventory capacity must be a positive integer/);
  assert.throws(
    () => addInventoryItem(source, { itemId: 'mistleaf', quantity: 0 }, ITEMS),
    /quantity to add must be a positive integer/,
  );
  assert.throws(
    () => removeInventoryItem(source, { itemId: 'mistleaf', quantity: -1 }, ITEMS),
    /quantity to remove must be a positive integer/,
  );
  assert.throws(
    () => getSelectedItemStack(inventoryWithSlots([null], 1)),
    /selectedSlotIndex must reference an inventory slot/,
  );
  assert.throws(
    () => addInventoryItem(
      inventoryWithSlots([{ itemId: 'mistleaf_seed', quantity: 100 }]),
      { itemId: 'mistleaf_seed', quantity: 1 },
      ITEMS,
    ),
    /exceeds maxStack/,
  );
});
