import type { ItemDefinition } from '../data/GameDataTypes';
import {
  getSelectedItemStack,
  selectInventorySlot,
  type InventoryState,
  type ItemStack,
  type SelectInventorySlotStatus,
} from './InventoryState';

export type QuickbarItemUse = 'empty' | 'till' | 'water' | 'plant' | 'carry';

export interface QuickbarSlotProjection {
  readonly slotIndex: number;
  readonly stack: ItemStack | null;
  readonly isSelected: boolean;
}

export interface QuickbarSelectionInput {
  readonly directSlotIndex: number | null;
  readonly selectPrevious: boolean;
  readonly selectNext: boolean;
}

export interface QuickbarSelectionLatch {
  readonly directSlotIndex: number | null;
  readonly previousHeld: boolean;
  readonly nextHeld: boolean;
}

export interface QuickbarSelectionResult {
  readonly status: 'idle' | SelectInventorySlotStatus;
  readonly inventory: InventoryState;
  readonly latch: QuickbarSelectionLatch;
}

export interface ResolvedQuickbarItem {
  readonly use: QuickbarItemUse;
  readonly stack: ItemStack | null;
  readonly definition: ItemDefinition | null;
}

export const RELEASED_QUICKBAR_SELECTION: QuickbarSelectionLatch = Object.freeze({
  directSlotIndex: null,
  previousHeld: false,
  nextHeld: false,
});

/** Projects the fixed inventory into deterministic left-to-right quickbar slots. */
export function createQuickbarProjection(
  inventory: InventoryState,
): ReadonlyArray<QuickbarSlotProjection> {
  getSelectedItemStack(inventory);
  return inventory.slots.map((stack, slotIndex) => ({
    slotIndex,
    stack,
    isSelected: slotIndex === inventory.selectedSlotIndex,
  }));
}

/** Classifies one stack without embedding item content tables in the UI. */
export function resolveQuickbarItem(
  stack: ItemStack | null,
  definitions: ReadonlyArray<ItemDefinition>,
  hoeItemId: string,
  wateringCanItemId: string,
): ResolvedQuickbarItem {
  if (stack === null) {
    return { use: 'empty', stack, definition: null };
  }

  const definition = definitions.find((item) => item.id === stack.itemId) ?? null;
  if (definition === null) {
    return { use: 'carry', stack, definition };
  }
  if (definition.type === 'tool' && definition.id === hoeItemId) {
    return { use: 'till', stack, definition };
  }
  if (definition.type === 'tool' && definition.id === wateringCanItemId) {
    return { use: 'water', stack, definition };
  }
  if (definition.type === 'seed') {
    return { use: 'plant', stack, definition };
  }
  return { use: 'carry', stack, definition };
}

/** Resolves the selected slot to the gameplay use shared by actions and HUD. */
export function resolveSelectedQuickbarItem(
  inventory: InventoryState,
  definitions: ReadonlyArray<ItemDefinition>,
  hoeItemId: string,
  wateringCanItemId: string,
): ResolvedQuickbarItem {
  return resolveQuickbarItem(
    getSelectedItemStack(inventory),
    definitions,
    hoeItemId,
    wateringCanItemId,
  );
}

/**
 * Applies edge-triggered direct or cyclic selection. Direct selection wins,
 * then previous, then next; cyclic selection wraps across the fixed capacity.
 */
export function updateQuickbarSelection(
  inventory: InventoryState,
  latch: QuickbarSelectionLatch,
  input: QuickbarSelectionInput,
): QuickbarSelectionResult {
  const nextLatch: QuickbarSelectionLatch = {
    directSlotIndex: input.directSlotIndex,
    previousHeld: input.selectPrevious,
    nextHeld: input.selectNext,
  };

  let requestedSlot: number | null = null;
  if (
    input.directSlotIndex !== null &&
    input.directSlotIndex !== latch.directSlotIndex
  ) {
    requestedSlot = input.directSlotIndex;
  } else if (input.selectPrevious && !latch.previousHeld) {
    requestedSlot = (
      inventory.selectedSlotIndex - 1 + inventory.slots.length
    ) % inventory.slots.length;
  } else if (input.selectNext && !latch.nextHeld) {
    requestedSlot = (inventory.selectedSlotIndex + 1) % inventory.slots.length;
  }

  if (requestedSlot === null) {
    return { status: 'idle', inventory, latch: nextLatch };
  }

  const selection = selectInventorySlot(inventory, requestedSlot);
  return {
    status: selection.status,
    inventory: selection.inventory,
    latch: nextLatch,
  };
}
