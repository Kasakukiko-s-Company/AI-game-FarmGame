import type { ItemDefinition } from '../data/GameDataTypes';

export const MVP_INVENTORY_CAPACITY = 8;

export interface ItemStack {
  readonly itemId: string;
  readonly quantity: number;
}

/** Persistable fixed-capacity inventory; every slot is also a quickbar slot. */
export interface InventoryState {
  readonly slots: ReadonlyArray<ItemStack | null>;
  readonly selectedSlotIndex: number;
}

export type AddInventoryItemStatus =
  | 'added'
  | 'inventory_full'
  | 'invalid_item';

export interface AddInventoryItemResult {
  readonly status: AddInventoryItemStatus;
  readonly inventory: InventoryState;
}

export type RemoveInventoryItemStatus =
  | 'removed'
  | 'insufficient_item'
  | 'invalid_item';

export interface RemoveInventoryItemResult {
  readonly status: RemoveInventoryItemStatus;
  readonly inventory: InventoryState;
}

export type SelectInventorySlotStatus =
  | 'selected'
  | 'already_selected'
  | 'invalid_slot';

export interface SelectInventorySlotResult {
  readonly status: SelectInventorySlotStatus;
  readonly inventory: InventoryState;
}

function assertPositiveInteger(value: number, name: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive integer`);
  }
}

function createItemCatalog(
  definitions: ReadonlyArray<ItemDefinition>,
): ReadonlyMap<string, ItemDefinition> {
  const catalog = new Map<string, ItemDefinition>();
  for (const definition of definitions) {
    if (definition.id.trim().length === 0) {
      throw new RangeError('item definition ID must not be empty');
    }
    assertPositiveInteger(
      definition.maxStack,
      `maxStack for item ${definition.id}`,
    );
    if (catalog.has(definition.id)) {
      throw new RangeError(`duplicate item definition: ${definition.id}`);
    }
    catalog.set(definition.id, definition);
  }
  return catalog;
}

function assertInventoryStructure(inventory: InventoryState): void {
  assertPositiveInteger(inventory.slots.length, 'inventory capacity');
  if (
    !Number.isInteger(inventory.selectedSlotIndex) ||
    inventory.selectedSlotIndex < 0 ||
    inventory.selectedSlotIndex >= inventory.slots.length
  ) {
    throw new RangeError('selectedSlotIndex must reference an inventory slot');
  }

  inventory.slots.forEach((stack, slotIndex) => {
    if (stack === null) {
      return;
    }
    if (stack.itemId.trim().length === 0) {
      throw new RangeError(`itemId in slot ${slotIndex} must not be empty`);
    }
    assertPositiveInteger(stack.quantity, `quantity in slot ${slotIndex}`);
  });
}

function assertInventoryMatchesCatalog(
  inventory: InventoryState,
  catalog: ReadonlyMap<string, ItemDefinition>,
): void {
  assertInventoryStructure(inventory);
  inventory.slots.forEach((stack, slotIndex) => {
    if (stack === null) {
      return;
    }
    const definition = catalog.get(stack.itemId);
    if (definition === undefined) {
      throw new RangeError(`unknown item ${stack.itemId} in slot ${slotIndex}`);
    }
    if (stack.quantity > definition.maxStack) {
      throw new RangeError(
        `quantity in slot ${slotIndex} exceeds maxStack for item ${stack.itemId}`,
      );
    }
  });
}

/** Creates an empty inventory whose slots also form the MVP quickbar. */
export function createInventory(
  capacity = MVP_INVENTORY_CAPACITY,
): InventoryState {
  assertPositiveInteger(capacity, 'inventory capacity');
  return {
    slots: Array.from({ length: capacity }, () => null),
    selectedSlotIndex: 0,
  };
}

/**
 * Adds the complete requested quantity or returns the original state unchanged.
 * Existing stacks are filled before empty slots are used.
 */
export function addInventoryItem(
  inventory: InventoryState,
  stack: ItemStack,
  definitions: ReadonlyArray<ItemDefinition>,
): AddInventoryItemResult {
  assertPositiveInteger(stack.quantity, 'quantity to add');
  const catalog = createItemCatalog(definitions);
  assertInventoryMatchesCatalog(inventory, catalog);

  const definition = catalog.get(stack.itemId);
  if (definition === undefined) {
    return { status: 'invalid_item', inventory };
  }

  const availableQuantity = inventory.slots.reduce((available, candidate) => {
    if (candidate === null) {
      return available + definition.maxStack;
    }
    if (candidate.itemId === stack.itemId) {
      return available + definition.maxStack - candidate.quantity;
    }
    return available;
  }, 0);
  if (availableQuantity < stack.quantity) {
    return { status: 'inventory_full', inventory };
  }

  const slots = inventory.slots.slice();
  let remaining = stack.quantity;
  for (let index = 0; index < slots.length && remaining > 0; index += 1) {
    const candidate = slots[index];
    if (
      candidate === undefined ||
      candidate === null ||
      candidate.itemId !== stack.itemId
    ) {
      continue;
    }
    const moved = Math.min(definition.maxStack - candidate.quantity, remaining);
    if (moved > 0) {
      slots[index] = { ...candidate, quantity: candidate.quantity + moved };
      remaining -= moved;
    }
  }
  for (let index = 0; index < slots.length && remaining > 0; index += 1) {
    if (slots[index] !== null) {
      continue;
    }
    const moved = Math.min(definition.maxStack, remaining);
    slots[index] = { itemId: stack.itemId, quantity: moved };
    remaining -= moved;
  }

  return {
    status: 'added',
    inventory: { ...inventory, slots },
  };
}

/** Removes the complete requested quantity from the lowest slots first. */
export function removeInventoryItem(
  inventory: InventoryState,
  stack: ItemStack,
  definitions: ReadonlyArray<ItemDefinition>,
): RemoveInventoryItemResult {
  assertPositiveInteger(stack.quantity, 'quantity to remove');
  const catalog = createItemCatalog(definitions);
  assertInventoryMatchesCatalog(inventory, catalog);

  if (!catalog.has(stack.itemId)) {
    return { status: 'invalid_item', inventory };
  }
  const availableQuantity = inventory.slots.reduce(
    (available, candidate) => candidate?.itemId === stack.itemId
      ? available + candidate.quantity
      : available,
    0,
  );
  if (availableQuantity < stack.quantity) {
    return { status: 'insufficient_item', inventory };
  }

  const slots = inventory.slots.slice();
  let remaining = stack.quantity;
  for (let index = 0; index < slots.length && remaining > 0; index += 1) {
    const candidate = slots[index];
    if (
      candidate === undefined ||
      candidate === null ||
      candidate.itemId !== stack.itemId
    ) {
      continue;
    }
    const moved = Math.min(candidate.quantity, remaining);
    const quantity = candidate.quantity - moved;
    slots[index] = quantity === 0 ? null : { ...candidate, quantity };
    remaining -= moved;
  }

  return {
    status: 'removed',
    inventory: { ...inventory, slots },
  };
}

/** Selects one existing quickbar slot without changing its contents. */
export function selectInventorySlot(
  inventory: InventoryState,
  slotIndex: number,
): SelectInventorySlotResult {
  assertInventoryStructure(inventory);
  if (
    !Number.isInteger(slotIndex) ||
    slotIndex < 0 ||
    slotIndex >= inventory.slots.length
  ) {
    return { status: 'invalid_slot', inventory };
  }
  if (slotIndex === inventory.selectedSlotIndex) {
    return { status: 'already_selected', inventory };
  }
  return {
    status: 'selected',
    inventory: { ...inventory, selectedSlotIndex: slotIndex },
  };
}

/** Returns the selected slot contents after validating the persisted shape. */
export function getSelectedItemStack(
  inventory: InventoryState,
): ItemStack | null {
  assertInventoryStructure(inventory);
  return inventory.slots[inventory.selectedSlotIndex] ?? null;
}
