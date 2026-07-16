import type { CropDefinition, ItemDefinition } from '../data/GameDataTypes';
import {
  removeInventoryItem,
  type ItemStack,
} from '../inventory/InventoryState';
import type { TileCoordinate } from '../world/TileInteraction';
import {
  harvestCrop,
  type HarvestCropStatus,
  type HarvestState,
} from './CropHarvesting';
import { plantCrop, type PlantCropStatus } from './CropPlanting';

export type CropInventoryActionStatus =
  | Exclude<HarvestCropStatus, 'no_crop'>
  | PlantCropStatus;

export interface CropInventoryActionResult {
  readonly status: CropInventoryActionStatus;
  readonly state: HarvestState;
  readonly harvestedItem: ItemStack | null;
  readonly consumedItem: ItemStack | null;
}

function rejectCropAction(
  status: Exclude<CropInventoryActionStatus, 'harvested' | 'planted'>,
  state: HarvestState,
): CropInventoryActionResult {
  return {
    status,
    state,
    harvestedItem: null,
    consumedItem: null,
  };
}

/**
 * Uses one contextual crop action: harvest an existing crop, or plant the
 * configured seed into empty tilled soil. Farm and inventory always commit
 * together, and rejected actions reuse the original combined state.
 */
export function useCropInventoryAction(
  state: HarvestState,
  target: TileCoordinate | null,
  seedItemId: string,
  currentDay: number,
  crops: ReadonlyArray<CropDefinition>,
  items: ReadonlyArray<ItemDefinition>,
): CropInventoryActionResult {
  const harvest = harvestCrop(state, target, crops, items);
  if (harvest.status === 'harvested') {
    return {
      status: harvest.status,
      state: harvest.state,
      harvestedItem: harvest.harvestedItem,
      consumedItem: null,
    };
  }
  if (harvest.status !== 'no_crop') {
    return rejectCropAction(harvest.status, state);
  }

  const seed: ItemStack = { itemId: seedItemId, quantity: 1 };
  const plantingProbe = plantCrop(
    state.farm,
    target,
    { ...seed, quantity: 0 },
    currentDay,
    crops,
  );
  if (plantingProbe.status === 'planted') {
    throw new Error('zero-quantity planting probe must not plant a crop');
  }
  if (plantingProbe.status !== 'no_seed') {
    return rejectCropAction(plantingProbe.status, state);
  }

  const removal = removeInventoryItem(state.inventory, seed, items);
  if (removal.status === 'invalid_item') {
    return rejectCropAction('invalid_item', state);
  }
  if (removal.status === 'insufficient_item') {
    return rejectCropAction('no_seed', state);
  }

  const planting = plantCrop(
    state.farm,
    target,
    seed,
    currentDay,
    crops,
  );
  if (planting.status !== 'planted') {
    return rejectCropAction(planting.status, state);
  }

  return {
    status: 'planted',
    state: {
      farm: planting.farm,
      inventory: removal.inventory,
    },
    harvestedItem: null,
    consumedItem: seed,
  };
}
