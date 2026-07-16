import type { CropDefinition, ItemDefinition } from '../data/GameDataTypes';
import {
  addInventoryItem,
  type InventoryState,
  type ItemStack,
} from '../inventory/InventoryState';
import type { TileCoordinate } from '../world/TileInteraction';
import { calculateCropGrowthStage } from './CropPlanting';
import type { FarmState } from './FarmState';

/** Farm and inventory snapshot committed together by one harvest command. */
export interface HarvestState {
  readonly farm: FarmState;
  readonly inventory: InventoryState;
}

export type HarvestCropStatus =
  | 'harvested'
  | 'not_tilled'
  | 'no_crop'
  | 'not_mature'
  | 'inventory_full'
  | 'invalid_crop'
  | 'invalid_item';

export interface HarvestCropResult {
  readonly status: HarvestCropStatus;
  readonly state: HarvestState;
  readonly harvestedItem: ItemStack | null;
}

function rejectHarvest(
  status: Exclude<HarvestCropStatus, 'harvested'>,
  state: HarvestState,
): HarvestCropResult {
  return { status, state, harvestedItem: null };
}

/**
 * Harvests one mature crop only when its complete configured yield fits.
 * Rejected actions reuse the original combined state, so crop and inventory
 * cannot be committed independently by accident.
 */
export function harvestCrop(
  state: HarvestState,
  target: TileCoordinate | null,
  crops: ReadonlyArray<CropDefinition>,
  items: ReadonlyArray<ItemDefinition>,
): HarvestCropResult {
  const tileIndex = target === null
    ? -1
    : state.farm.tiles.findIndex(
      (tile) => tile.x === target.x && tile.y === target.y,
    );
  if (tileIndex < 0) {
    return rejectHarvest('not_tilled', state);
  }

  const tile = state.farm.tiles[tileIndex];
  if (tile === undefined) {
    return rejectHarvest('not_tilled', state);
  }
  if (tile.crop === null) {
    return rejectHarvest('no_crop', state);
  }

  const definition = crops.find((crop) => crop.id === tile.crop?.cropId);
  if (definition === undefined) {
    return rejectHarvest('invalid_crop', state);
  }
  const growth = calculateCropGrowthStage(
    tile.crop.growthProgress,
    definition.growthStages,
  );
  if (!growth.isMature) {
    return rejectHarvest('not_mature', state);
  }

  const harvestedItem: ItemStack = {
    itemId: definition.harvestItemId,
    quantity: definition.harvestQuantity,
  };
  const addition = addInventoryItem(state.inventory, harvestedItem, items);
  if (addition.status === 'inventory_full') {
    return rejectHarvest('inventory_full', state);
  }
  if (addition.status === 'invalid_item') {
    return rejectHarvest('invalid_item', state);
  }

  return {
    status: 'harvested',
    state: {
      farm: {
        ...state.farm,
        tiles: state.farm.tiles.map((candidate, index) =>
          index === tileIndex ? { ...candidate, crop: null } : candidate),
      },
      inventory: addition.inventory,
    },
    harvestedItem,
  };
}
